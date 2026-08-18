package com.example.trafo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Ta metoda pozwoli nam sprawdzić, czy dany email z providerow już istnieje w DB
    Optional<User> findByEmail(String email);
}