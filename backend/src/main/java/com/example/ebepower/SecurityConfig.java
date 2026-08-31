package com.example.ebepower;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 1. Osobny Bean dla konfiguracji CORS (uruchamiany na samym początku)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "https://sklep.ebe-power.pl",
                "https://www.sklep.ebe-power.pl",
                "https://frontend-1078992546635.europe-west1.run.app",
                "http://localhost:3000",
                "http://localhost:3001"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // 2. Łańcuch zabezpieczeń
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtService jwtService) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Automatycznie używa powyższego Beana corsConfigurationSource
                .csrf(csrf -> csrf.disable())
                // Panel admina jest stateless — sesja przychodzi jako JWT NextAuth
                // (nagłówek Authorization lub ciasteczko), weryfikowany w AdminAuthFilter.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new AdminAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Przepuszcza wszystkie zapytania OPTIONS
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/cart", "/api/cart/**").permitAll()
                        .requestMatchers("/api/payment/create-payment-intent").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/payment", "/api/payment/**").permitAll()
                        .requestMatchers("/api/webhook", "/api/webhook/**").permitAll()
                        // API panelu administratora — wymaga roli ADMIN (AdminAuthFilter
                        // ustawia ją po weryfikacji sesji NextAuth). Gdy backend nie zna
                        // NEXTAUTH_SECRET, filtr przepuszcza żądania (loguje ostrzeżenie) —
                        // główną bramą jest wtedy middleware + proxy na frontendzie.
                        .requestMatchers("/api/orders/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
