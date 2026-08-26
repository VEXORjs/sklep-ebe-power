package com.example.trafo;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    // Zdefiniowany adres e-mail sklepu
    private final String ADMIN_EMAIL = "kontakt@ebe-power.pl";

    public EmailService(JavaMailSender mailSender){
        this.mailSender = mailSender;
    }

    // Twoja dotychczasowa metoda dla klienta
    @Async
    public void sendOrderConfirmation(String toEmail, Long orderId, BigDecimal amount){
        if (toEmail == null || !toEmail.contains("@") || toEmail.endsWith("@domain.com")) {
            System.out.println("📧 Pomijam e-mail potwierdzający — brak prawdziwego adresu odbiorcy.");
            return;
        }

        SimpleMailMessage message = getSimpleMailMessage(toEmail, orderId, amount);

        mailSender.send(message);
        System.out.println("📧 E-mail z potwierdzeniem wysłany do klienta: " + toEmail);
    }

    private SimpleMailMessage getSimpleMailMessage(String toEmail, Long orderId, BigDecimal amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(ADMIN_EMAIL);
        message.setTo(toEmail);
        message.setSubject("Potwierdzenie zamówienia #" + orderId);
        message.setText(
                "Dziękujemy za zakupy w naszym sklepie!\n\n" +
                        "Twoja płatność na kwotę " + amount + " PLN została zaksięgowana pomyślnie.\n" +
                        "Identyfikator zamówienia: " + orderId + "\n\n" +
                        "Pozdrawiamy,\nZespół EBE POWER"
        );
        return message;
    }

    // NOWA METODA: Powiadomienie wewnętrzne dla obsługi sklepu
    @Async
    public void sendAdminOrderNotification(Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(ADMIN_EMAIL);
        message.setTo(ADMIN_EMAIL); // Wysyłasz sam do siebie
        message.setSubject("NOWE ZAMÓWIENIE OPŁACONE: #" + order.getId());

        // Generowanie listy produktów jako tekstu
        // UWAGA: Upewnij się, że używasz odpowiednich getterów z Twoich klas OrderItem / Product
        String itemsList = order.getItems().stream()
                .map(item -> "- " + item.getProduct().getName() + " | Ilość: " + item.getQuantity() + " | Cena: " + item.getPrice() + " PLN")
                .collect(Collectors.joining("\n"));

        message.setText(
                "Otrzymano nową, opłaconą transakcję w sklepie!\n\n" +
                        "--- SZCZEGÓŁY ZAMÓWIENIA ---\n" +
                        "ID zamówienia: " + order.getId() + "\n" +
                        "Kwota całkowita: " + order.getAmount() + " PLN\n\n" +
                        "--- DANE KLIENTA ---\n" +
                        "E-mail: " + order.getCustomerEmail() + "\n\n" +
                        "--- TRANSAKCJA ---\n" +
                        "Status transakcji: " + order.getStatus() +  "\n\n" +
                        "--- ZAKUPIONE PRODUKTY ---\n" +
                        itemsList + "\n\n"
        );

        mailSender.send(message);
        System.out.println("📧 E-mail z powiadomieniem wewnętrznym wysłany na: " + ADMIN_EMAIL);
    }

    @Async
    public void sendAdminStockWarningNotification(Order order, String stockIssues) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(ADMIN_EMAIL);
        message.setTo(ADMIN_EMAIL);
        message.setSubject("⚠️ PILNE: ZAMÓWIENIE #" + order.getId() + " OPŁACONE, BRAK TOWARU!");

        message.setText(
                "Otrzymano opłaconą transakcję, ale brakuje produktów w magazynie!\n\n" +
                        "--- BRAKI MAGAZYNOWE ---\n" +
                        stockIssues + "\n" +
                        "Skontaktuj się z klientem (" + order.getCustomerEmail() + ") w celu ustalenia wydłużenia czasu dostawy lub zwrotu środków.\n\n" +
                        "--- SZCZEGÓŁY ZAMÓWIENIA ---\n" +
                        "ID zamówienia: " + order.getId() + "\n" +
                        "Kwota całkowita: " + order.getAmount() + " PLN\n"
        );

        mailSender.send(message);
        System.out.println("🚨 Alert magazynowy wysłany do admina dla zamówienia #" + order.getId());
    }
}