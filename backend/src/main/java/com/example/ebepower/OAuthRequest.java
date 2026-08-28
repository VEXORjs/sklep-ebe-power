package com.example.ebepower;

public class OAuthRequest {
    private String email;
    private String name;
    private String provider;
    private String password;

    public OAuthRequest() {}

    // Gettery i Settery
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}