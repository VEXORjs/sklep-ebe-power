package com.example.ebepower;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Tworzy konto administratora panelu (/admin) przy starcie aplikacji, jeśli
 * jeszcze nie istnieje. Dane logowania konfiguruje się zmiennymi środowiskowymi:
 *
 *   ADMIN_EMAIL     — domyślnie admin@ebe-power.pl
 *   ADMIN_PASSWORD  — jeśli nieustawione, generujemy losowe hasło i wypisujemy je
 *                     DO LOGÓW (bezpieczne domyślnie: nikt nie odgadnie hasła z
 *                     repozytorium). Na produkcji ZAWSZE ustaw ADMIN_PASSWORD.
 *
 * Konto jest odtwarzane przy każdym starcie (hibernate ddl-auto=create czyści
 * bazę), więc usunięcie go w bazie nie pomoże — zmień dane w env lub wyłącz
 * bean.
 */
@Component
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:admin@ebe-power.pl}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        if (email.isEmpty()) {
            log.warn("ADMIN_EMAIL puste — pomijam tworzenie konta administratora.");
            return;
        }

        if (userRepository.findByEmail(email).isPresent()) {
            log.info("Konto administratora {} już istnieje.", email);
            return;
        }

        // Bez ADMIN_PASSWORD generujemy losowe hasło i wypisujemy je do logów,
        // żeby panel nie miał znanego-publicznie domyślnego hasła.
        String password = (adminPassword != null && !adminPassword.isBlank())
                ? adminPassword
                : ("admin-" + UUID.randomUUID());
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("ADMIN_PASSWORD nieustawione — wygenerowano losowe hasło dla {}: {}", email, password);
            log.warn("Ustaw ADMIN_PASSWORD w środowisku (Cloud Run / docker-compose), aby ustabilizować dane logowania.");
        }

        User admin = new User();
        admin.setName("Administrator");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        log.info("Utworzono konto administratora panelu: {} (logowanie: /admin/login)", email);
    }
}
