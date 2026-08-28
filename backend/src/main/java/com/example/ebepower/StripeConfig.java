package com.example.ebepower;
import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {
    @Value("${stripe.stripe_secret_key:${STRIPE_SECRET_KEY:}}")
    private String stripeSecretKey;

    @PostConstruct
    public void initStripe(){
        Stripe.apiKey = stripeSecretKey;
    }
}