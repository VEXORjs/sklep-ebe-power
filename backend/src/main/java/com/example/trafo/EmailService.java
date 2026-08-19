package com.example.trafo;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender){
        this.mailSender = mailSender;
    }

    @Async
    public void sendOrderConfirmation(String toEmail, Long orderId, BigDecimal amount){
        if (toEmail == null || !toEmail.contains("@") || toEmail.endsWith("@domain.com")) {
            System.out.println("📧 Pomijam e-mail potwierdzający — brak prawdziwego adresu odbiorcy.");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("trafo@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Potwierdzenie zamówienia #" + orderId);
        message.setText(
                "Dziękujemy za zakupy w naszym sklepie!\n\n" +
                "Twoja płatność na kwotę " + amount + " PLN została zaksięgowana pomyślnie.\n" +
                "Identyfikator zamówienia: " + orderId + "\n\n" +
                "Pozdrawiamy,\nZespół TRAFO ENERGIA"
        );

        mailSender.send(message);
        System.out.println("📧 E-mail z potwierdzeniem wysłany do: " + toEmail);
    }
}
