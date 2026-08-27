import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.net.Webhook;
        System.out.println("📬 Odebrano webhook od Stripe. Typ zdarzenia: " + eventType);

        if ("payment_intent.succeeded".equals(eventType)) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isPresent()) {
                PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();
            // Wersjo-odporna deserializacja: standardowa ścieżka + fallback
            // PaymentIntent.retrieve (patrz StripeEventUtils — bez tego eventy
            // z nowszą wersją API, np. 2026-06-24.dahlia, były po cichu pomijane).
            PaymentIntent paymentIntent = StripeEventUtils.extractPaymentIntent(event, payload);
            if (paymentIntent != null) {
                String stripeId = paymentIntent.getId();
                System.out.println("💰 Płatność zakończona sukcesem dla ID: " + stripeId);
                try {
                    System.out.println("❌ Błąd przetwarzania zamówienia: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Order processing failed");
                }
            } else {
                System.out.println("🛑 [Stripe] Event " + event.getId()
                        + " (payment_intent.succeeded) bez danych PaymentIntent — pomijam.");
            }
        } else {
            System.out.println("ℹ️ Ignoruję zdarzenie typu: " + eventType);

backend/src/main/java/com/example/trafo/StripeEventUtils.java+64

package com.example.trafo;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pomocnik dla webhooków Stripe — odczyt PaymentIntent niezależnie od wersji API.
 *
 * EventDataObjectDeserializer.getObject() zwraca PUSTY Optional, gdy wersja API
 * eventu (np. 2026-06-24.dahlia) różni się od wersji wspieranej przez bibliotekę
 * stripe-java w projekcie. Dotąd oznaczało to CICHE zignorowanie eventu:
 * backend odpowiadał 200 OK, zamówienie zostawało PENDING, a maile
 * z potwierdzeniem nie wychodziły.
 *
 * Ta klasa najpierw próbuje standardowej deserializacji (gdy wersje się zgadzają),
 * a w razie niepowodzenia wyciąga id PaymentIntent bezpośrednio z tekstu payloadu
 * (wyłącznie java.util.regex — projekt nie ma jackson-databind na classpath)
 * i pobiera pełny obiekt z API Stripe (zawsze w wersji zgodnej z biblioteką).
 */
final class StripeEventUtils {

    // W payloadzie eventu payment_intent.succeeded jedyny obiekt o id z prefiksem
    // "pi_" to sam PaymentIntent (charge'y mają "ch_", refundy "re_" itd.),
    // więc to dopasowanie jest jednoznaczne.
    private static final Pattern PAYMENT_INTENT_ID =
            Pattern.compile("\"id\"\\s*:\\s*\"(pi_[^\"]+)\"");

    private StripeEventUtils() {
    }

    static PaymentIntent extractPaymentIntent(Event event, String payload) {
        // 1) Standardowa ścieżka — działa, gdy wersja API eventu zgadza się z biblioteką.
        if (event.getDataObjectDeserializer().getObject().isPresent()) {
            return (PaymentIntent) event.getDataObjectDeserializer().getObject().get();
        }

        // 2) Fallback — id z surowego payloadu + pobranie obiektu z API Stripe.
        try {
            String id = findPaymentIntentId(payload);
            if (id != null && !id.isBlank()) {
                System.out.println("ℹ️ [Stripe] Wersja API eventu (" + event.getApiVersion()
                        + ") różni się od wersji biblioteki — pobieram PaymentIntent " + id
                        + " bezpośrednio z API Stripe.");
                return PaymentIntent.retrieve(id);
            }
            System.out.println("🛑 [Stripe] Event " + event.getId() + " nie zawiera id PaymentIntent.");
        } catch (Exception e) {
            System.out.println("🛑 [Stripe] Nie udało się odczytać PaymentIntent z eventu "
                    + event.getId() + " (id z payloadu może być testowe/nieistniejące): " + e.getMessage());
        }
        return null;
    }

    private static String findPaymentIntentId(String payload) {
        if (payload == null || payload.isEmpty()) {
            return null;
        }
        Matcher matcher = PAYMENT_INTENT_ID.matcher(payload);
        return matcher.find() ? matcher.group(1) : null;
    }
}
