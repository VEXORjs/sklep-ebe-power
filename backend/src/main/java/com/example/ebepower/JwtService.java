package com.example.ebepower;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

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
        Map<String, Object> claims = decodeSessionToken(token);
        if (claims == null) return null;

        // NextAuth często zapisuje id użytkownika w polu "id" lub "sub" (subject)
        Object id = claims.get("id");
        if (id == null) {
            Object sub = claims.get("sub");
            return sub != null ? String.valueOf(sub) : null;
        }
        return String.valueOf(id);
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

    /**
     * Info dla wyprowadzenia klucza szyfrowania sesji NextAuth (HKDF).
     * Musi być identyczne jak w next-auth/jwt → getDerivedEncryptionKey().
     */
    private static final String NEXTAUTH_HKDF_INFO = "NextAuth.js Generated Encryption Key";
    private static final ObjectMapper JSON = new ObjectMapper();

    /**
     * Dekoduje token sesji NextAuth niezależnie od formatu i zwraca claimsy:
     *
     *  1. JWE (alg=dir, enc=A256GCM) — DOMYŚLNY format next-auth v4. Ciasteczko
     *     sesji jest SZYFROWANE (nie podpisane!), dlatego stary verifyAndDecode()
     *     oparty na java-jwt (HMAC256) odrzucał każdą sesję i cały panel /admin
     *     dostawał 401, gdy tylko ustawiono NEXTAUTH_SECRET na backendzie.
     *     Klucz AES wyprowadzamy HKDF-SHA256 z NEXTAUTH_SECRET — dokładnie tak
     *     jak next-auth (node:crypto.hkdf(sha256, secret, "", info, 32)).
     *  2. Klasyczny podpisany JWT HS256 — gdy frontend ma custom encode/decode.
     *
     * Zwraca null dla tokenów nieprawidłowych lub wygasłych (tolerancja 15 s,
     * jak w next-auth jwtDecrypt).
     */
    public Map<String, Object> decodeSessionToken(String token) {
        if (token == null) return null;
        String[] parts = token.split("\\.", -1);

        if (parts.length == 5) {
            Map<String, Object> claims = decryptNextAuthJwe(parts);
            return claims != null && !expired(claims) ? claims : null;
        }

        if (parts.length == 3) {
            DecodedJWT jwt = verifyAndDecode(token);
            if (jwt == null) return null;
            Map<String, Object> claims = new java.util.HashMap<>();
            for (Map.Entry<String, Claim> e : jwt.getClaims().entrySet()) {
                Claim c = e.getValue();
                if (c == null || c.isNull()) continue;
                String asString = c.asString();
                if (asString != null) {
                    claims.put(e.getKey(), asString);
                } else if (c.asLong() != null) {
                    claims.put(e.getKey(), c.asLong());
                } else if (c.asBoolean() != null) {
                    claims.put(e.getKey(), c.asBoolean());
                }
            }
            return expired(claims) ? null : claims;
        }

        return null;
    }

    private boolean expired(Map<String, Object> claims) {
        Object exp = claims.get("exp");
        if (exp instanceof Number n) {
            return n.doubleValue() < System.currentTimeMillis() / 1000.0 - 15;
        }
        return false;
    }

    /**
     * Deszyfrowanie JWE w formacie kompaktowym (RFC 7516):
     *   header . (puste — dir) . iv . ciphertext . tag
     * AAD = ASCII zbase64url nagłówka, AES-256-GCM (IV 12 B, tag 16 B).
     */
    private Map<String, Object> decryptNextAuthJwe(String[] parts) {
        if (nextAuthSecret == null || nextAuthSecret.isBlank()) return null;
        try {
            Map<String, Object> header = JSON.readValue(
                    Base64.getUrlDecoder().decode(parts[0]),
                    new TypeReference<Map<String, Object>>() {}
            );
            if (!"dir".equals(header.get("alg")) || !"A256GCM".equals(header.get("enc"))) {
                return null;
            }

            byte[] key = hkdfSha256(
                    nextAuthSecret.trim().getBytes(StandardCharsets.UTF_8),
                    NEXTAUTH_HKDF_INFO.getBytes(StandardCharsets.UTF_8),
                    32
            );
            byte[] iv = Base64.getUrlDecoder().decode(parts[2]);
            byte[] ciphertext = Base64.getUrlDecoder().decode(parts[3]);
            byte[] tag = Base64.getUrlDecoder().decode(parts[4]);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(128, iv));
            cipher.updateAAD(parts[0].getBytes(StandardCharsets.US_ASCII));

            byte[] ciphertextAndTag = new byte[ciphertext.length + tag.length];
            System.arraycopy(ciphertext, 0, ciphertextAndTag, 0, ciphertext.length);
            System.arraycopy(tag, 0, ciphertextAndTag, ciphertext.length, tag.length);

            byte[] plaintext = cipher.doFinal(ciphertextAndTag);
            return JSON.readValue(plaintext, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            // Zły sekret, uszkodzony token, nieznany algorytm — traktuj jak brak sesji
            return null;
        }
    }

    /**
     * HKDF (RFC 5869) z HMAC-SHA256. Pusty salt wg RFC to HashLen zer — dokładnie
     * tyle samo, co robi Node/OpenSSL dla hkdfSync(..., Buffer.alloc(0), ...).
     */
    private static byte[] hkdfSha256(byte[] ikm, byte[] info, int length) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");

        // Extract: PRK = HMAC-SHA256(salt = 32 zera, IKM)
        mac.init(new SecretKeySpec(new byte[32], "HmacSHA256"));
        byte[] prk = mac.doFinal(ikm);

        // Expand: T(i) = HMAC(PRK, T(i-1) || info || i)
        mac.init(new SecretKeySpec(prk, "HmacSHA256"));
        byte[] out = new byte[length];
        byte[] t = new byte[0];
        int pos = 0;
        byte counter = 1;
        while (pos < length) {
            mac.reset();
            mac.update(t);
            mac.update(info);
            mac.update(counter);
            t = mac.doFinal();
            int n = Math.min(t.length, length - pos);
            System.arraycopy(t, 0, out, pos, n);
            pos += n;
            counter++;
        }
        return out;
    }

    /** Czy backend zna sekret NextAuth (warunek aktywnej ochrony /api/admin). */
    public boolean hasNextAuthSecret() {
        return nextAuthSecret != null && !nextAuthSecret.isBlank();
    }

    public String getNextAuthSecret() {
        return nextAuthSecret;
    }
}
