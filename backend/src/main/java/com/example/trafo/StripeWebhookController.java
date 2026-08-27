package com.example.trafo;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/webhook")
public class StripeWebhookController {

    @Autowired
    private OrderService orderService;

    // Klucz weryfikacyjny (pobierzesz go z Stripe CLI w kroku 3)
    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        if (endpointSecret == null || endpointSecret.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Webhook secret not configured");
        }

        try {
            // 1. Weryfikacja czy żądanie naprawdę pochodzi od Stripe
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            System.out.println("🛑 Nieautoryzowane zapytanie! Zły podpis cyfrowy.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // 2. Obsługa konkretnego zdarzenia sukcesu płatności
        if ("payment_intent.succeeded".equals(event.getType())) {
            // Wersjo-odporna deserializacja: standardowa ścieżka + fallback
            // PaymentIntent.retrieve (patrz StripeEventUtils — bez tego eventy
            // z nowszej wersji API, np. 2026-06-24.dahlia, były po cichu pomijane).
            PaymentIntent paymentIntent = StripeEventUtils.extractPaymentIntent(event, payload);

            if (paymentIntent != null) {
                System.out.println("✅ Otrzymano potwierdzenie płatności dla ID: " + paymentIntent.getId());
                System.out.println("💰 Kwota: " + paymentIntent.getAmount() + " " + paymentIntent.getCurrency());

               try {
                   // Cały PaymentIntent — OrderService odzyska z niego e-mail klienta-gościa.
                   orderService.processSuccessfulPayment(paymentIntent);
               } catch (Exception e){
                   System.out.println("❌ Błąd przetwarzania zamówienia w bazie: " + e.getMessage());
               }
            } else {
                System.out.println("🛑 [Stripe] Event " + event.getId()
                        + " (payment_intent.succeeded) bez danych PaymentIntent — pomijam.");
            }
        } else {
            System.out.println("ℹ️ [Stripe] Ignoruję zdarzenie typu: " + event.getType() + " (id: " + event.getId() + ")");
        }

        // Zawsze zwracamy 200 OK do Stripe, żeby potwierdzić odebranie paczki danych
        return ResponseEntity.ok("Success");
    }
}