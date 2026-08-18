package com.example.trafo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Podstawowe operacje odziedziczone po JpaRepository wystarczą
}