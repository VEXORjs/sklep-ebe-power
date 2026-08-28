package com.example.ebepower;

import java.math.BigDecimal;

public class CartItemDto {
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private int quantity;
    private BigDecimal totalPrice; // cena * ilość

    public CartItemDto(CartItem item) {
        this.productId = item.getProduct().getId();
        this.productName = item.getProduct().getName();
        this.productPrice = item.getProduct().getPrice();
        this.quantity = item.getQuantity();
        this.totalPrice = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    // --- Gettery ---
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public BigDecimal getProductPrice() { return productPrice; }
    public int getQuantity() { return quantity; }
    public BigDecimal getTotalPrice() { return totalPrice; }
}