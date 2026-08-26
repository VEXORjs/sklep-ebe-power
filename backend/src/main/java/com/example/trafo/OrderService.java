package com.example.trafo;

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

    @Transactional
    public void processSuccessfulPayment(String stripePaymentIntentId) {
        Order order = orderRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new RuntimeException("Zamówienie dla PaymentIntent " + stripePaymentIntentId + " nie istnieje!"));

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

        // Wysyłanie maili
        try {
            emailService.sendOrderConfirmation(order.getCustomerEmail(), order.getId(), order.getAmount());

            if (requiresIntervention) {
                emailService.sendAdminStockWarningNotification(order, stockIssues.toString());
            } else {
                emailService.sendAdminOrderNotification(order);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Nie udało się wysłać e-maila: " + e.getMessage());
        }
    }
}
