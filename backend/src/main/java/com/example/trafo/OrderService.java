package com.example.trafo;

// 🟢 Wymagane importy ze Spring Framework i bibliotek Javy
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository; // Do aktualizacji stocku

    @Transactional
    public void processSuccessfulPayment(String stripePaymentIntentId) {
        // 1. Znajdź zamówienie powiązane z tą płatnością
        Order order = orderRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new RuntimeException("🛑 Zamówienie dla PaymentIntent " + stripePaymentIntentId + " nie istnieje!"));

        // 2. Zabezpieczenie: jeśli zamówienie jest już opłacone, pomiń
        if (OrderStatus.PAID.equals(order.getStatus())) {
            System.out.println("⚠️ Zamówienie " + order.getId() + " było już oznaczone jako opłacone.");
            return;
        }

        // 3. Aktualizacja statusu zamówienia
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
        System.out.println("💾 Status zamówienia " + order.getId() + " zmieniony na PAID.");

        // 4. Zmniejszenie stanu magazynowego (Stock) dla każdego zakupionego transformatora
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int purchasedQuantity = item.getQuantity();

            // 🟢 Jeśli w Twojej encji Product pole magazynowe nazywa się 'stock', upewnij się, że posiada metody getStock() oraz setStock()
            if (product.getStock() < purchasedQuantity) {
                throw new RuntimeException("🛑 Brak wystarczającej ilości produktu " + product.getName() + " w magazynie!");
            }

            product.setStock(product.getStock() - purchasedQuantity);
            productRepository.save(product);
            System.out.println("📦 Zmniejszono stock dla: " + product.getName() + " o " + purchasedQuantity + " szt.");
        }
    }
}