package com.example.trafo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Spring Data JPA automatycznie wygeneruje zapytanie SQL na podstawie nazwy metody!
    Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);
}