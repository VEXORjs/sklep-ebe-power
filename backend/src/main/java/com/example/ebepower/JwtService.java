package com.example.ebepower;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JwtService {

    /**
     * Klasyczny sekret aplikacji (application.properties → jwt.secret).
     * NEXTAUTH_SECRET jest doklejany w konstruktorze (poniżej), żeby ten sam
     * serwis potrafił zweryfikować tokeny sesji NextAuth niezależnie od tego,
     * którą z wartości ustawi operator środowiska.
     */
    @Value("${jwt.secret}")
    private String secret;

    /**
     * Sekret NextAuth (ta sama wartość, którą podpisuje frontend).
     * Bez niego backend niezweryfikuje ciasteczka sesji
     * (__Secure-next-auth.session-token) wysyłanego przez proxy /api/backend.
     */
    @Value("${NEXTAUTH_SECRET:}")
    private String nextAuthSecret;

    /** Lista sekretów do próby weryfikacji HMAC (bez duplikatów, bez pustych). */
    private List<String> candidateSecrets() {
        List<String> secrets = new ArrayList<>();
        if (secret != null && !secret.isBlank()) secrets.add(secret.trim());
        if (nextAuthSecret != null && !nextAuthSecret.isBlank() && !secrets.contains(nextAuthSecret.trim())) {
            secrets.add(nextAuthSecret.trim());
        }
        return secrets;
    }

    public String verifyTokenAndGetUserId(String token) {
        if (token == null || !token.contains(".")) {
            return token; // Zwracamy bezpośrednio przekazane ID ("1")
        }
        DecodedJWT jwt = verifyAndDecode(token);
        if (jwt == null) return null;

        // NextAuth często zapisuje id użytkownika w polu "id" lub "sub" (subject)
        if (jwt.getClaim("id").isNull()) {
            return jwt.getSubject();
        }
        return jwt.getClaim("id").asString();
    }

    /**
     * Weryfikuje podpis JWT (HMAC256) próbując wszystkich skonfigurowanych
     * sekretów. Zwraca zdekodowany token albo null, gdy podpis/wygasoło się
     * nie zgadzają.
     */
    public DecodedJWT verifyAndDecode(String token) {
        if (token == null || !token.contains(".")) {
            return null;
        }
        for (String candidate : candidateSecrets()) {
            try {
                Algorithm algorithm = Algorithm.HMAC256(candidate);
                return JWT.require(algorithm).build().verify(token);
            } catch (JWTVerificationException | IllegalArgumentException ignored) {
                // Zły sekret lub sfałszowany token — próbujemy następnego sekretu
            }
        }
        return null;
    }

    /** Czy backend zna sekret NextAuth (warunek aktywnej ochrony /api/admin). */
    public boolean hasNextAuthSecret() {
        return nextAuthSecret != null && !nextAuthSecret.isBlank();
    }

    public String getNextAuthSecret() {
        return nextAuthSecret;
    }
}
