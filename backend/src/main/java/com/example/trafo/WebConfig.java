package com.example.trafo;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Zezwól na wszystkie endpointy
                .allowedOrigins(
                        "http://localhost:3000", "http://127.0.0.1:3000",
                        "http://localhost:3001", "http://127.0.0.1:3001",
                        "https://frontend-1078992546635.europe-west1.run.app",
                        "https://sklep.ebe-power.pl", "https://www.sklep.ebe-power.pl")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
