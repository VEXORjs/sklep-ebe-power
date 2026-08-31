package com.example.ebepower;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Weryfikacja dekodowania sesji NextAuth w JwtService.
 *
 * Najważniejszy przypadek: next-auth v4 wystawia ciasteczko sesji jako JWE
 * (alg=dir, enc=A256GCM), a NIE jako podpisany JWT HS256. Wektory testowe
 * poniżej zostały wygenerowane prawdziwą biblioteką `jose` (node_modules
 * next-auth) z sekretem "devsecret-abcdef-0123456789", więc ten test jest
 * niezależnym dowodem, że implementacja HKDF + AES-GCM po stronie Javy jest
 * zgodna bit w bit z tym, co podpisuje frontend.
 */
class JwtServiceJweTest {

    private static final String SECRET = "devsecret-abcdef-0123456789";

    /** Sesja ADMIN (sub=7), exp = 2000000000 (rok 2033) — wektor stabilny w czasie. */
    private static final String VALID_ADMIN_JWE =
            "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ZFrUbaYGOVK8-02j.8mI73P1iUkl7j5VFgr15rip52HsL4Xao16fihv3NVdNJW8j3A9uNCG7cZXd5BE6RHoEa-VTyRCXlcRfQwdxYa3-InvAOJlEBVZbZ4M-0-TU4gJA6FnYFMzTj0Q7bHAiyP0zJ7qo9pq4kI_m9jw.nc5zYkb3UK_yYTDCyLs6pw";

    /** Sesja wygasła godzinę przed wygenerowaniem wektora — musi zostać odrzucona. */
    private static final String EXPIRED_JWE =
            "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..6ag2ThkBZW-l0Abb.vMSJljfDJdzV6fXkTYRYm_gN825iBexYDs_uXJn-lr18yav_jZ0L-nHhfZXNWn9Gg_3l4gmH3ZTtVKP7Jgb0W3gao0ut.tMnXHgv5hLUFV2Yd_fM7Bg";

    /** Prawidłowa sesja, ale rola USER (sub=9), exp = 2000000000. */
    private static final String USER_JWE =
            "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..cuHZ5Bho9xi-mtIk.zhvxWj0RPgABehP311gYvZYRM4oJQ0wVRdHIXOIE-RuelKv10RzvkalyuqEiE97Ap84wYao2RPYfHWk4u1CIZkupcsk.3IWmj5k56zHfJBFkvAYD7A";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Pole @Value wstrzygujemy ręcznie — test jest jednostkowy, bez kontekstu Springa
        ReflectionTestUtils.setField(jwtService, "nextAuthSecret", SECRET);
    }

    @Test
    void decryptsValidAdminSessionJwe() {
        Map<String, Object> claims = jwtService.decodeSessionToken(VALID_ADMIN_JWE);

        assertNotNull(claims, "Ważna sesja JWE musi się odszyfrować");
        assertEquals("ADMIN", claims.get("role"));
        assertEquals("7", claims.get("sub"));
        assertEquals("7", claims.get("id"));
        assertEquals("a@b.pl", claims.get("email"));
    }

    @Test
    void rejectsExpiredSession() {
        assertNull(jwtService.decodeSessionToken(EXPIRED_JWE), "Wygasła sesja musi zostać odrzucona");
    }

    @Test
    void decodesUserRoleForForbiddenCheck() {
        Map<String, Object> claims = jwtService.decodeSessionToken(USER_JWE);

        assertNotNull(claims);
        assertEquals("USER", claims.get("role"), "Rola USER jest odszyfrowywana poprawnie (filtr sam zwróci 403)");
    }

    @Test
    void rejectsJweWithWrongSecret() {
        ReflectionTestUtils.setField(jwtService, "nextAuthSecret", "zly-sekret");
        assertNull(jwtService.decodeSessionToken(VALID_ADMIN_JWE), "Obcy sekret nie może odszyfrować sesji");
    }

    @Test
    void rejectsGarbageTokens() {
        assertNull(jwtService.decodeSessionToken(null));
        assertNull(jwtService.decodeSessionToken(""));
        assertNull(jwtService.decodeSessionToken("abcdef"));
        assertNull(jwtService.decodeSessionToken("a.b.c.d.e.f"));
    }

    @Test
    void cartMockTokenPassesThrough() {
        // Token koszyka "user<id>" (bez kropki) JwtService zwraca bez zmian — jak dotychczas
        assertEquals("42", jwtService.verifyTokenAndGetUserId("user42"));
    }
}
