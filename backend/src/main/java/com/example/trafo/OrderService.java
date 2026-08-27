package com.example.trafo;

import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Order createPendingOrder(String customerEmail, BigDecimal amount, String stripePaymentIntentId, List<OrderItem> items) {
        Order order = new Order(customerEmail, amount, stripePaymentIntentId);
        List<OrderItem> attached = new ArrayList<>();
        if (items != null) {
            for (OrderItem item : items) {
                item.setOrder(order);
                attached.add(item);
            }
        }
        order.setItems(attached);
        return orderRepository.save(order);
    }

    // Preferowany wariant dla webhooków Stripe: poza id przekazuje cały
    // PaymentIntent, dzięki czemu można odzyskać PRAWDZIWY adres e-mail klienta
    // (np. gość, który wpisał maila dopiero w oknie płatności Stripe).
    @Transactional
    public void processSuccessfulPayment(PaymentIntent paymentIntent) {
        Order order = orderRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .orElseThrow(() -> new RuntimeException("Zamówienie dla PaymentIntent " + paymentIntent.getId() + " nie istnieje!"));

        recoverCustomerEmail(order, paymentIntent);
        markPaidAndNotify(order);
    }

    // Wariant po samym id (zachowany dla zgodności ze starym przepływem).
    @Transactional
    public void processSuccessfulPayment(String stripePaymentIntentId) {
        Order order = orderRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new RuntimeException("Zamówienie dla PaymentIntent " + stripePaymentIntentId + " nie istnieje!"));

        markPaidAndNotify(order);
    }

            // Gość nie podaje maila przy tworzeniu PaymentIntent (frontend wysyła null),
        // więc zamówienie dostaje placeholder gosc@domain.com / klient_<id>@domain.com,
        // a EmailService celowo pomija takie adresy. E-mail wpisany przez klienta w
    // Stripe (Link Authentication Element) ląduje na PaymentIntencie / charge'u —
    // odzyskujemy go stamtąd i zapisujemy na zamówieniu przed wysłaniem potwierdzenia.
    private void recoverCustomerEmail(Order order, PaymentIntent paymentIntent) {
        String current = order.getCustomerEmail();
        if (isRealEmail(current)) {
            return; // normalny adres — nic do zrobienia
        }

        String realEmail = null;

        // 1) receipt_email na PaymentIntencie (bywa ustawione, gdy e-mail był znany wcześniej)
        try {
            if (isRealEmail(paymentIntent.getReceiptEmail())) {
                realEmail = paymentIntent.getReceiptEmail().trim();
            }
        } catch (Exception ignored) {
        }

        // 2) E-mail wpisany w oknie płatności Stripe → billing_details/receipt_email powiązanego charge'a
        String latestChargeId = paymentIntent.getLatestCharge();
        if (realEmail == null && latestChargeId != null && !latestChargeId.isBlank()) {
            try {
                Charge charge = Charge.retrieve(latestChargeId);
                if (charge != null) {
                    if (isRealEmail(charge.getReceiptEmail())) {
                        realEmail = charge.getReceiptEmail().trim();
                    } else if (charge.getBillingDetails() != null
                            && isRealEmail(charge.getBillingDetails().getEmail())) {
                        realEmail = charge.getBillingDetails().getEmail().trim();
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ [Mail] Nie udało się pobrać danych karty/obciążenia ze Stripe: " + e.getMessage());
            }
        }

        if (realEmail != null) {
            order.setCustomerEmail(realEmail);
            System.out.println("📧 [Mail] Odzyskano adres klienta ze Stripe: " + realEmail
                    + " (poprzednio: " + current + ").");
        } else {
            System.out.println("⚠️ [Mail] Brak prawdziwego adresu klienta dla zamówienia #" + order.getId()
                    + " — potwierdzenie do klienta zostanie pominięte (kopia dla obsługi wyjdzie normalnie).");
        }
    }

    private boolean isRealEmail(String email) {
        return email != null && email.contains("@") && !email.trim().endsWith("@domain.com");
    }

    private void markPaidAndNotify(Order order) {
        if (OrderStatus.PAID.equals(order.getStatus()) || OrderStatus.PAID_OUT_OF_STOCK.equals(order.getStatus())) {
            System.out.println("⚠️ Zamówienie " + order.getId() + " było już oznaczone jako opłacone.");
            return;
        }

        boolean requiresIntervention = false;
        StringBuilder stockIssues = new StringBuilder();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product == null) {
                    continue;
                }

                int purchasedQuantity = item.getQuantity();
                Long currentStock = product.getStock() == null ? 0L : product.getStock();

                if (currentStock < purchasedQuantity) {
                    // Oznaczamy zamówienie do ręcznej obsługi
                    requiresIntervention = true;
                    stockIssues.append("- ").append(product.getName())
                            .append(" (Zamówiono: ").append(purchasedQuantity)
                            .append(", Na stanie: ").append(currentStock).append(")\n");

                    // Zbijamy stock do 0, aby zdjąć produkt ze strony i zapobiec dalszej sprzedaży
                    product.setStock(0L);
                    System.out.println("🚨 Krytyczny brak w magazynie dla: " + product.getName());
                } else {
                    product.setStock(currentStock - purchasedQuantity);
                    System.out.println("📦 Zmniejszono stock dla: " + product.getName() + " o " + purchasedQuantity + " szt.");
                }
                productRepository.save(product);
            }
        }

        // Aktualizacja statusu zależnie od stanu magazynu
        if (requiresIntervention) {
            order.setStatus(OrderStatus.PAID_OUT_OF_STOCK);
            System.out.println("💾 Status zamówienia " + order.getId() + " zmieniony na PAID_OUT_OF_STOCK.");
        } else {
            order.setStatus(OrderStatus.PAID);
            System.out.println("💾 Status zamówienia " + order.getId() + " zmieniony na PAID.");
        }

        orderRepository.save(order);

        // Wysyłanie maili. UWAGA: metody EmailService są @Async — wykonują się w
        // osobnym wątku, więc try/catch tutaj i tak by NIC nie złapał. Błędy
        // wysyłki są łapane i logowane (z pełnym stacktrace'em) wewnątrz EmailService.
        emailService.sendOrderConfirmation(order.getCustomerEmail(), order.getId(), order.getAmount());

        if (requiresIntervention) {
            emailService.sendAdminStockWarningNotification(order, stockIssues.toString());
        } else {
            emailService.sendAdminOrderNotification(order);
        }
    }
}
