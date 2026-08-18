package com.example.trafo;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.net.Webhook;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;


@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "https://frontend-1078992546635.europe-west1.run.app"})
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final CartService cartService;

    public PaymentController(OrderRepository orderRepository, EmailService emailService, CartService cartService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
        this.cartService = cartService;
    }

    public static class CheckoutRequest {
        private String userId;
        private java.util.List<ItemRequest> items;

        public String getUserId() { return userId; }
        public java.util.List<ItemRequest> getItems() { return items; }

        public static class ItemRequest {
            private Long productId;
            private int quantity;

            public Long getProductId() { return productId; }
            public int getQuantity() { return quantity; }
        }
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CheckoutRequest paymentRequest) throws StripeException {
        try {
            String userId = paymentRequest.getUserId();
            BigDecimal totalAmount;

            // 1. Zabezpieczenie przed null / pustym stringiem z frontendu
            if (userId != null && !userId.trim().isEmpty()) {
                Cart cart = cartService.getOrCreateCart(userId);
                if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Koszyk jest pusty"));
                }
                totalAmount = new CartDto(cart).getCartTotal();
            } else {
                // 🚪 Gość: sprawdzamy przesłaną listę produktów
                if (paymentRequest.getItems() == null || paymentRequest.getItems().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Koszyk gościa jest pusty"));
                }
                // Obliczamy sumę na podstawie przesłanych produktów
                totalAmount = cartService.calculateTotalForItems(paymentRequest.getItems());
            }

            long amountInCents = totalAmount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("pln")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            String customerEmail = (userId != null) ? "klient_" + userId + "@domain.com" : "gosc@domain.com";
            Order order = new Order(customerEmail, totalAmount, paymentIntent.getId());
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of("clientSecret", paymentIntent.getClientSecret()));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Błąd Stripe: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            System.out.println("❌ Błąd weryfikacji podpisu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        String eventType = event.getType();
        System.out.println("📬 Odebrano webhook od Stripe. Typ zdarzenia: " + eventType);

        if ("payment_intent.succeeded".equals(eventType)) {
            // Wyciągamy dane o płatności
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isPresent()) {
                PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();

                String stripeId = paymentIntent.getId();
                System.out.println("💰 Płatność zakończona sukcesem dla ID: " + stripeId);
                System.out.println("💵 Kwota: " + paymentIntent.getAmount() + " " + paymentIntent.getCurrency());

                //zmiana statusu w bazie danych na oplacone oraz email do klienta
                Optional<Order> orderOptional = orderRepository.findByStripePaymentIntentId(stripeId);

                if(orderOptional.isPresent()){
                    Order order = orderOptional.get();
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);
                    System.out.println("✅ Zamówienie #" + order.getId() + " zostało oznaczone jako OPŁACONE w PostgreSQL.");

                    emailService.sendOrderConfirmation(order.getCustomerEmail(), order.getId(), order.getAmount());
                }
                else {
                    System.out.println("⚠️ Otrzymano płatność dla Stripe ID: " + stripeId + ", ale nie znaleziono takiego zamówienia w bazie danych!");
                }
            }
        } else {
            System.out.println("ℹ️ Ignoruję zdarzenie typu: " + eventType);
        }
        return ResponseEntity.ok("Webhook obsluzony prawidlowo");
    }
}