package com.example.ebepower;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class EmailService {

    // Adres powiadomień wewnętrznych sklepu (odbiorca kopii dla obsługi)
    private final String ADMIN_EMAIL = "kontakt@ebe-power.pl";

    private final JavaMailSender mailSender;
    private final String smtpUsername;
    private final String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String smtpUsername,
            @Value("${shop.mail.from:kontakt@ebe-power.pl}") String fromAddress) {
        this.mailSender = mailSender;
        this.smtpUsername = smtpUsername == null ? "" : smtpUsername.trim();
        this.fromAddress = (fromAddress == null || fromAddress.isBlank()) ? ADMIN_EMAIL : fromAddress.trim();
        logMailConfig();
    }

    // Przy starcie wypisuje efektywną konfigurację SMTP (BEZ hasła) i ostrzega
    // przed najczęstszymi przyczynami "cichego" niewychodzenia poczty.
    private void logMailConfig() {
        System.out.println("📧 [Mail] Konfiguracja SMTP: login="
                + (smtpUsername.isBlank() ? "BRAK (!)" : smtpUsername)
                + ", from=" + fromAddress);
        if (smtpUsername.isBlank()) {
            System.out.println("🚨 [Mail] MAIL_USERNAME jest PUSTE — żaden e-mail nie wyjdzie z aplikacji! "
                    + "Ustaw MAIL_USERNAME oraz MAIL_PASSWORD w zmiennych środowiskowych usługi "
                    + "(Cloud Run: gcloud run services update ebe-power --update-env-vars MAIL_USERNAME=... MAIL_PASSWORD=...).");
        } else if (!smtpUsername.equalsIgnoreCase(fromAddress)) {
            System.out.println("⚠️ [Mail] Adres nadawcy (" + fromAddress + ") różni się od loginu SMTP ("
                    + smtpUsername + "). Serwery hostingowe (seohost) zwykle ODRZUCAJĄ taką wysyłkę. "
                    + "Zaloguj się kontem " + fromAddress + " albo ustaw MAIL_FROM=" + smtpUsername + ".");
        }
    }

    // Potwierdzenie dla klienta
    // UWAGA: @Async wykonuje kod w osobnym wątku — wyjątek z tej metody
    // NIE trafi do try/catch w OrderService. Dlatego każda wysyłka ma
    // własną obsługę błędów z pełnym stacktrace'em (widocznym w logach).
    @Async
    public void sendOrderConfirmation(String toEmail, Long orderId, BigDecimal amount){
        if (toEmail == null || !toEmail.contains("@") || toEmail.endsWith("@domain.com")) {
            System.out.println("📧 [Mail] Pomijam potwierdzenie zamówienia #" + orderId
                    + " — brak prawdziwego adresu odbiorcy (" + toEmail + ").");
            return;
        }

        try {
            SimpleMailMessage message = getSimpleMailMessage(toEmail, orderId, amount);
            mailSender.send(message);
            System.out.println("📧 [Mail] Potwierdzenie zamówienia #" + orderId + " wysłane do klienta: " + toEmail);
        } catch (Exception e) {
            System.out.println("🚨 [Mail] NIE udało się wysłać potwierdzenia do klienta " + toEmail
                    + " (zamówienie #" + orderId + "): " + e);
            e.printStackTrace();
        }
    }

    private SimpleMailMessage getSimpleMailMessage(String toEmail, Long orderId, BigDecimal amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
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

    // Powiadomienie wewnętrzne dla obsługi sklepu (kopia na kontakt@ebe-power.pl)
    @Async
    public void sendAdminOrderNotification(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(ADMIN_EMAIL);
            message.setSubject("NOWE ZAMÓWIENIE OPŁACONE: #" + order.getId());

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
            System.out.println("📧 [Mail] Powiadomienie wewnętrzne o zamówieniu #" + order.getId()
                    + " wysłane na: " + ADMIN_EMAIL);
        } catch (Exception e) {
            System.out.println("🚨 [Mail] NIE udało się wysłać powiadomienia wewnętrznego na " + ADMIN_EMAIL
                    + " (zamówienie #" + order.getId() + "): " + e);
            e.printStackTrace();
        }
    }

    @Async
    public void sendAdminStockWarningNotification(Order order, String stockIssues) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
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
            System.out.println("📧 [Mail] Alert magazynowy dla zamówienia #" + order.getId()
                    + " wysłany na: " + ADMIN_EMAIL);
        } catch (Exception e) {
            System.out.println("🚨 [Mail] NIE udało się wysłać alertu magazynowego na " + ADMIN_EMAIL
                    + " (zamówienie #" + order.getId() + "): " + e);
            e.printStackTrace();
        }
    }

    // Testowa wysyłka (SYNCHRONICZNA — celowo rzuca wyjątek do wywołującego,
    // żeby endpoint /api/payment/mail-test mógł zwrócić dokładną przyczynę błędu).
    public void sendTestEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Test SMTP — sklep EBE POWER");
        message.setText(
                "To wiadomość testowa konfiguracji SMTP.\n\n" +
                        "Czas wysłania: " + LocalDateTime.now() + "\n" +
                        "Login SMTP: " + (smtpUsername.isBlank() ? "(pusty!)" : smtpUsername) + "\n" +
                        "Nadawca (from): " + fromAddress + "\n\n" +
                        "Jeśli to czytasz — poczta działa."
        );
        mailSender.send(message);
    }
}
