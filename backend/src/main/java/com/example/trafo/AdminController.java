package com.example.trafo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"https://frontend-1078992546635.europe-west1.run.app", "http://localhost:3000", "http://localhost:3001", "https://sklep.ebe-power.pl", "https://www.sklep.ebe-power.pl"})
public class AdminController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();

        List<Product> allProducts = productRepository.findAll();
        long lowStock = allProducts.stream().filter(p -> p.getStock() != null && p.getStock() > 0 && p.getStock() <= 5).count();
        long outOfStock = allProducts.stream().filter(p -> p.getStock() == null || p.getStock() <= 0).count();
        long inStock = totalProducts - outOfStock;

        List<Order> allOrders = orderRepository.findAll();
        long pending = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long paid = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PAID).count();
        long paidOutOfStock = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PAID_OUT_OF_STOCK).count();
        long completed = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count();
        long cancelled = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.PAID_OUT_OF_STOCK)
                .map(Order::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("inStock", inStock);
        stats.put("lowStock", lowStock);
        stats.put("outOfStock", outOfStock);
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pending);
        stats.put("paidOrders", paid);
        stats.put("paidOutOfStockOrders", paidOutOfStock);
        stats.put("completedOrders", completed);
        stats.put("cancelledOrders", cancelled);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalUsers", totalUsers);

        // Recent low stock products
        List<Product> lowStockProducts = allProducts.stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 5)
                .sorted((a,b) -> Long.compare(a.getStock() == null ? 0 : a.getStock(), b.getStock() == null ? 0 : b.getStock()))
                .limit(10)
                .collect(Collectors.toList());
        stats.put("lowStockProducts", lowStockProducts);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
