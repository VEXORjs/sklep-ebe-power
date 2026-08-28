package com.example.ebepower;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class CartDto {
    private String userId;
    private List<CartItemDto> items;
    private BigDecimal cartTotal; // Suma za cały koszyk

    public CartDto(Cart  cart) {
        this.userId = cart.getUserId();
        this.items = cart.getItems().stream()
                .map(CartItemDto::new)
                .collect(Collectors.toList());

        // Automatyczne podliczanie sumy koszyka
        this.cartTotal = this.items.stream()
                .map(CartItemDto::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // --- Gettery ---
    public String getUserId() { return userId; }
    public List<CartItemDto> getItems() { return items; }
    public BigDecimal getCartTotal() { return cartTotal; }
}