package com.example.trafo;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final JwtService jwtService;

    public CartController(CartService cartService, JwtService jwtService) {
        this.cartService = cartService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        // 1. Sprawdzamy czy nagłówek zaczyna się od "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(Map.of(
                    "items", java.util.List.of(),
                    "totalItems", 0,
                    "isGuest", true
            ));
        }

        // 2. Wycinamy sam token (usuwamy słowo "Bearer ")
        String token = authHeader.substring(7);

        // 3. Weryfikujemy token w JwtService
        String userId = jwtService.verifyTokenAndGetUserId(token);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token wygasł lub jest nieprawidłowy");
        }

        // 4. Jeśli wszystko OK, bezpiecznie pobieramy koszyk dla zalogowanego użytkownika
        Cart cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(new CartDto(cart));
    }

    @PostMapping("/{userId}/add")
    public CartDto addProduct(
            @PathVariable String userId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity) {
        Cart updatedCart = cartService.addProductToCart(userId, productId, quantity);
        return new CartDto(updatedCart);
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public CartDto removeProduct(@PathVariable String userId, @PathVariable Long productId) {
        Cart updatedCart = cartService.removeProductFromCart(userId, productId);
        return new CartDto(updatedCart);
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable String userId){
        Cart clearedCart = cartService.clearCartByUserId(userId);
        return ResponseEntity.ok(new CartDto(clearedCart));
    }
}