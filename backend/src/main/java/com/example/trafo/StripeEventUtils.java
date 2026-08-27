package com.example.trafo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;

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
 * a w razie niepowodzenia wyciąga id z surowego JSON-a i pobiera pełny obiekt
 * bezpośrednio z API Stripe (zawsze w wersji zgodnej z biblioteką).
 */
final class StripeEventUtils {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private StripeEventUtils() {
    }

    static PaymentIntent extractPaymentIntent(Event event, String payload) {
        // 1) Standardowa ścieżka — działa, gdy wersja API eventu zgadza się z biblioteką.
        if (event.getDataObjectDeserializer().getObject().isPresent()) {
            return (PaymentIntent) event.getDataObjectDeserializer().getObject().get();
        }

        // 2) Fallback — id z surowego payloadu + pobranie obiektu z API Stripe.
        try {
            JsonNode root = MAPPER.readTree(payload);
            String id = root.path("data").path("object").path("id").asText(null);
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
}
