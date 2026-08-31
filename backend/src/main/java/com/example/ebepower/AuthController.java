package com.example.ebepower;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3000", "https://frontend-1078992546635.europe-west1.run.app"})
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/oauth-success")
    public ResponseEntity<?> handleOAuthSuccess(@RequestBody OAuthRequest request) {
        try {
            User user = userService.processOAuthLogin(request);

            if(user == null) {
                return ResponseEntity.status(401).body("Nieprawidłowy email lub hasło");
            }

            String mockToken = "user" + user.getId();

            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "mockToken", mockToken,
                    "message", "Synchronizacja OAuth zakończona pomyślnie"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Błąd po stronie Javy: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> handleRegister(@RequestBody RegisterRequest registerRequest){
        if (userService.registerUser(registerRequest) == null){
            return ResponseEntity.status(409).body("Email jest już zajęty");
        }
        else {
            return ResponseEntity.status(200).body("Udało się zarejestrować");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> handleLogin(@RequestBody LoginRequest loginRequest) {
        User user = userService.processUser(loginRequest);

        if (user == null) {
            return ResponseEntity.status(401).body("Nieprawidłowy email lub hasło");
        }

        // Jeśli logowanie się udało, zwracamy dane użytkownika, które NextAuth zapisze w sesji.
        // `mockToken` jest używany przez frontend jako token koszyka (JwtService zwraca go
        // bez zmian, bo nie zawiera kropki), więc musi być tu tak samo jak w /oauth-success.
        String mockToken = "user" + user.getId();

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole() == null ? "USER" : user.getRole(),
                "mockToken", mockToken
        ));
    }

    /**
     * Logowanie do panelu administratora (/admin/login).
     * Różni się od /login tym, że oprócz poprawnych danych WYMAGA roli ADMIN —
     * klient sklepu z poprawnym hasłem dostanie 403 i nie utworzy sesji
     * administratora.
     */
    @PostMapping("/admin-login")
    public ResponseEntity<?> handleAdminLogin(@RequestBody LoginRequest loginRequest) {
        User user = userService.processUser(loginRequest);

        if (user == null) {
            return ResponseEntity.status(401).body("Nieprawidłowy email lub hasło");
        }
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("To konto nie ma uprawnień administratora");
        }

        String mockToken = "user" + user.getId();

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", "ADMIN",
                "mockToken", mockToken
        ));
    }
}