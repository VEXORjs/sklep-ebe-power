package com.example.ebepower;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    /**
     * Rola użytkownika: "USER" (klient sklepu) lub "ADMIN" (panel administracyjny).
     * Rola jest zapisywana w tokenie sesji NextAuth i weryfikowana przez
     * AdminAuthFilter przy wywołaniach /api/admin/** oraz /api/orders/**.
     */
    @Column(nullable = false)
    private String role = "USER";

    // Bezargumentowy konstruktor wymagany przez JPA
    public User() {}

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Hash hasła nigdy nie może trafić do JSON-a (np. GET /api/admin/users)
    @JsonIgnore
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}