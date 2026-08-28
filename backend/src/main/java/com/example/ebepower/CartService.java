package com.example.ebepower;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository; // Zakładam, że masz już ProductRepository

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    // 🔍 Pobieranie koszyka użytkownika (lub tworzenie nowego, jeśli jeszcze go nie ma)
    public Cart getOrCreateCart(String userId) {
        return cartRepository.findFirstByUserIdOrderByIdDesc(userId)
                .orElseGet(() -> cartRepository.save(new Cart(userId)));
    }

    // 📥 Dodawanie produktu do koszyka
    @Transactional
    public Cart addProductToCart(String userId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(userId);

        // Szukamy produktu w bazie danych
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono produktu o ID: " + productId));

        // Sprawdzamy, czy ten produkt jest już w koszyku
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Jeśli produkt już jest, zwiększamy jego ilość
            existingItem.get().incrementQuantity(quantity);
        } else {
            // Jeśli produktu nie ma, tworzymy nową pozycję CartItem i dodajemy do listy
            CartItem newItem = new CartItem(cart, product, quantity);
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateProductQuantity(String userId, Long productId, int quantity) {
        if (quantity <= 0) {
            return removeProductFromCart(userId, productId);
        }
        Cart cart = getOrCreateCart(userId);
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();
        if (existingItem.isEmpty()) {
            return addProductToCart(userId, productId, quantity);
        }
        existingItem.get().setQuantity(quantity);
        return cartRepository.save(cart);
    }

    // 🗑️ Usuwanie konkretnej pozycji z koszyka
    @Transactional
    public Cart removeProductFromCart(String userId, Long productId) {
        Cart cart = getOrCreateCart(userId);

        // Usuwamy pozycję z listy na podstawie ID produktu (JPA zajmie się usunięciem z bazy przez orphanRemoval)
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart clearCartByUserId(String userId) {
        return cartRepository.findFirstByUserIdOrderByIdDesc(userId).map(cart -> {
            cart.getItems().clear();
            System.out.println("🛒 Koszyk użytkownika " + userId + " został opróżniony po udanej płatności.");
            return cartRepository.save(cart);
        }).orElseGet(() -> {
            return getOrCreateCart(userId);
        });
    }

    public BigDecimal calculateTotalForItems(java.util.List<PaymentController.CheckoutRequest.ItemRequest> items) {
        BigDecimal total = BigDecimal.ZERO;

        for (PaymentController.CheckoutRequest.ItemRequest item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono produktu o ID: " + item.getProductId()));

            // Tutaj obliczamy wartość dla danego produktu i dodajemy do sumy
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);
        }

        return total;
    }
}
