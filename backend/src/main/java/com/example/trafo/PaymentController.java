package com.example.trafo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.net.Webhook;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        "https://frontend-1078992546635.europe-west1.run.app",
        "https://ebe-power.pl", "https://www.ebe-power.pl"
})
@RequestMapping("/api/payment")
public class PaymentController {

    private static final BigDecimal VAT_MULTIPLIER = new BigDecimal("1.23");
//    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500.00");
//    private static final BigDecimal SHIPPING_COST = new BigDecimal("16.99");
    public static final BigDecimal FIRST_STARTUP_FEE = new BigDecimal("1000.00");

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    // Token chroniący endpoint diagnostyczny /api/payment/mail-test.
    // Pusty (domyślnie) = endpoint wyłączony. Ustaw MAIL_TEST_TOKEN, aby włączyć.
    @Value("${shop.mail.test-token:}")
    private String mailTestToken;

    private final OrderService orderService;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    public PaymentController(OrderService orderService, CartService cartService,
                             ProductRepository productRepository, EmailService emailService) {
        this.orderService = orderService;
        this.cartService = cartService;
        this.productRepository = productRepository;
        this.emailService = emailService;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CheckoutRequest {
        private String userId;
        private String customerEmail;
        private boolean firstStartup;
        private List<ItemRequest> items;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public boolean isFirstStartup() { return firstStartup; }
        public void setFirstStartup(boolean firstStartup) { this.firstStartup = firstStartup; }
        public List<ItemRequest> getItems() { return items; }
        public void setItems(List<ItemRequest> items) { this.items = items; }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ItemRequest {
            private Long productId;
            private int quantity;

            public Long getProductId() { return productId; }
            public void setProductId(Long productId) { this.productId = productId; }
            public int getQuantity() { return quantity; }
            public void setQuantity(int quantity) { this.quantity = quantity; }
        }
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CheckoutRequest paymentRequest) {
        try {
            if (paymentRequest == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Brak danych zamówienia"));
            }

            String userId = paymentRequest.getUserId();
            boolean hasUser = userId != null && !userId.trim().isEmpty() && !"guest".equalsIgnoreCase(userId.trim());

            List<OrderItem> orderItems = new ArrayList<>();
            BigDecimal netTotal;

            if (hasUser) {
                Cart cart = cartService.getOrCreateCart(userId);
                if (cart != null && cart.getItems() != null && !cart.getItems().isEmpty()) {
                    netTotal = BigDecimal.ZERO;
                    for (CartItem cartItem : cart.getItems()) {
                        Product product = cartItem.getProduct();
                        BigDecimal line = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                        netTotal = netTotal.add(line);
                        orderItems.add(new OrderItem(null, product, cartItem.getQuantity(), product.getPrice()));
                    }
                } else if (paymentRequest.getItems() != null && !paymentRequest.getItems().isEmpty()) {
                    netTotal = buildItemsFromRequest(paymentRequest.getItems(), orderItems);
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Koszyk jest pusty"));
                }
            } else {
                if (paymentRequest.getItems() == null || paymentRequest.getItems().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Koszyk gościa jest pusty"));
                }
                netTotal = buildItemsFromRequest(paymentRequest.getItems(), orderItems);
            }

            if (paymentRequest.isFirstStartup()) {
                netTotal = netTotal.add(FIRST_STARTUP_FEE);
            }

            BigDecimal gross = netTotal.multiply(VAT_MULTIPLIER).setScale(2, RoundingMode.HALF_UP);
//            BigDecimal shipping = gross.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_COST;
            BigDecimal payable = gross.setScale(2, RoundingMode.HALF_UP);
            long amountInGrosze = payable.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValue();

            if (amountInGrosze < 200) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kwota zamówienia jest zbyt niska do płatności Stripe"));
            }

            if (com.stripe.Stripe.apiKey == null || com.stripe.Stripe.apiKey.isBlank()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "Brak konfiguracji Stripe (STRIPE_SECRET_KEY)"));
            }

            String email = resolveEmail(paymentRequest.getCustomerEmail(), userId);

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInGrosze)
                    .setCurrency("pln")
                    .putMetadata("userId", hasUser ? userId : "guest")
                    .putMetadata("email", email)
                    .putMetadata("firstStartup", paymentRequest.isFirstStartup() ? "true" : "false")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );

            if (email != null && email.contains("@") && !email.endsWith("@domain.com")) {
                paramsBuilder.setReceiptEmail(email);
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
            orderService.createPendingOrder(email, payable, paymentIntent.getId(), orderItems);

            return ResponseEntity.ok(Map.of(
                    "clientSecret", paymentIntent.getClientSecret(),
                    "amount", payable,
                    "currency", "pln"
            ));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Błąd Stripe: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            String message = e.getMessage() != null ? e.getMessage() : "Nie udało się utworzyć płatności";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", message));
        }
    }

    private BigDecimal buildItemsFromRequest(List<CheckoutRequest.ItemRequest> items, List<OrderItem> orderItems) {
        BigDecimal total = BigDecimal.ZERO;
        for (CheckoutRequest.ItemRequest item : items) {
            if (item.getProductId() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Nieprawidłowa pozycja koszyka");
            }
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono produktu o ID: " + item.getProductId()));
            if (product.getStock() != null && product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Niewystarczający stan magazynowy: " + product.getName());
            }
            BigDecimal line = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(line);
            orderItems.add(new OrderItem(null, product, item.getQuantity(), product.getPrice()));
        }
        return total;
    }

    private String resolveEmail(String requested, String userId) {
        if (requested != null && requested.contains("@")) {
            return requested.trim();
        }
        if (userId != null && !userId.isBlank() && !"guest".equalsIgnoreCase(userId)) {
            return "klient_" + userId + "@domain.com";
        }
        return "gosc@domain.com";
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        if (webhookSecret == null || webhookSecret.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Webhook secret not configured");
        }

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            System.out.println("❌ Błąd weryfikacji podpisu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        String eventType = event.getType();
        System.out.println("📬 Odebrano webhook od Stripe. Typ zdarzenia: " + eventType);

        if ("payment_intent.succeeded".equals(eventType)) {
            // Wersjo-odporna deserializacja: standardowa ścieżka + fallback
            // PaymentIntent.retrieve (patrz StripeEventUtils — bez tego eventy
            // z nowszą wersją API, np. 2026-06-24.dahlia, były po cichu pomijane).
            PaymentIntent paymentIntent = StripeEventUtils.extractPaymentIntent(event, payload);
            if (paymentIntent != null) {
                String stripeId = paymentIntent.getId();
                System.out.println("💰 Płatność zakończona sukcesem dla ID: " + stripeId);
                try {
                    // Przekazujemy CAŁY PaymentIntent (nie samo id) — OrderService
                    // odzyska z niego prawdziwy e-mail klienta-gościa przed wysłaniem potwierdzenia.
                    orderService.processSuccessfulPayment(paymentIntent);
                } catch (Exception e) {
                    System.out.println("❌ Błąd przetwarzania zamówienia: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Order processing failed");
                }
            } else {
                System.out.println("🛑 [Stripe] Event " + event.getId()
                        + " (payment_intent.succeeded) bez danych PaymentIntent — pomijam.");
            }
        } else {
            System.out.println("ℹ️ Ignoruję zdarzenie typu: " + eventType);
        }
        return ResponseEntity.ok("Webhook obsluzony prawidlowo");
    }

    // Endpoint diagnostyczny: sprawdza na żywo, czy SMTP działa, i zwraca DOKŁADNĄ
    // przyczynę ewentualnego błędu (np. 535 błędne hasło, 550 odrzucony nadawca,
    // timeout). Wyłączony, dopóki nie ustawisz zmiennej MAIL_TEST_TOKEN.
    //
    //   curl -X POST "https://<backend>/api/payment/mail-test?token=TWOJ_TOKEN"
    //   curl -X POST "https://<backend>/api/payment/mail-test?token=TWOJ_TOKEN&to=inny@adres.pl"
    @PostMapping("/mail-test")
    public ResponseEntity<String> mailTest(
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "token", required = false) String token) {

        if (mailTestToken == null || mailTestToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Endpoint wyłączony. Ustaw zmienną środowiskową MAIL_TEST_TOKEN, aby go włączyć.");
        }
        if (token == null || !token.equals(mailTestToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nieprawidłowy token.");
        }

        String recipient = (to == null || to.isBlank()) ? "kontakt@ebe-power.pl" : to.trim();
        try {
            emailService.sendTestEmail(recipient);
            return ResponseEntity.ok("✅ Testowy e-mail został wysłany na: " + recipient);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Wysyłka nie powiodła się — przyczyna: " + e.getClass().getSimpleName()
                            + ": " + e.getMessage());
        }
    }
}
