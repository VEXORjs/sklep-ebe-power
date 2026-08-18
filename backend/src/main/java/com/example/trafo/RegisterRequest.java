package com.example.trafo;

public class RegisterRequest {
    private String email;
    private String password;
    private String name;

    // Bezargumentowy konstruktor jest wymagany przez Springa do mapowania JSON-a
    public RegisterRequest() {}

    // Gettery i Settery
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}