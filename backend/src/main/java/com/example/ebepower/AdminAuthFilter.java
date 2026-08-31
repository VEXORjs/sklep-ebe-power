package com.example.ebepower;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Ochrona API panelu administratora (/api/admin/**, /api/orders/**).
 *
 * Akceptuje sesję NextAuth przekazaną na dwa sposoby:
 *  1. nagłówek  Authorization: Bearer <token>
 *  2. ciasteczko next-auth.session-token / __Secure-next-auth.session-token
 *     (przeglądarka wysyła je automatycznie do proxy /api/backend na frontendzie,
 *      a proxy przekazuje wszystkie nagłówki 1:1 do backendu).
 *
 * Token musi być podpisany HMAC256 wspólnym sekretem (NEXTAUTH_SECRET) i
 * zawierać claim role=ADMIN. Rolę dokleja do tokena frontend w callbacku
 * `jwt` NextAuth na podstawie odpowiedzi /api/auth/login.
 *
 * UWAGA: filtr NIE jest beanem @Component — rejestruje go wyłącznie
 * SecurityConfig (addFilterBefore), dzięki czemu działa tylko w łańcuchu
 * Spring Security, bez podwójnej rejestracji servletowej.
 *
 * Jeśli NEXTAUTH_SECRET nie jest ustawiony na backendzie, filtr przepuszcza
 * żądania i loguje wyraźne ostrzeżenie — dzięki temu panel nigdy nie „padnie"
 * po samym wdrożeniu. Główną bramę stanowi wtedy middleware na frontendzie
 * (weryfikacja sesji) + brama w proxy /api/backend. Po ustawieniu sekretu
 * backend zaczyna wymuszać ROLE_ADMIN na poziomie Spring Security.
 */
public class AdminAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthFilter.class);

    private static final String SESSION_COOKIE_INSECURE = "next-auth.session-token";
    private static final String SESSION_COOKIE_SECURE = "__Secure-next-auth.session-token";

    private final JwtService jwtService;
    private volatile boolean warnedMissingSecret = false;

    public AdminAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith("/api/admin") || path.startsWith("/api/orders"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (!jwtService.hasNextAuthSecret()) {
            if (!warnedMissingSecret) {
                warnedMissingSecret = true;
                log.warn("ADMIN API: NEXTAUTH_SECRET nie jest ustawiony na backendzie — "
                        + "ochrona /api/admin i /api/orders jest NIEAKTYWNA. "
                        + "Ustaw NEXTAUTH_SECRET (ta sama wartość co na frontendzie), aby wymusić rolę ADMIN.");
            }
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        // Obsługuje oba formaty sesji NextAuth: domyślne JWE (dir + A256GCM)
        // oraz podpisane JWT HS256 — patrz JwtService.decodeSessionToken().
        Map<String, Object> claims = jwtService.decodeSessionToken(token);

        if (claims == null) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "unauthorized", "Brak lub nieprawidłowa sesja. Zaloguj się w panelu administratora.");
            return;
        }

        Object roleClaim = claims.get("role");
        if (!"ADMIN".equals(roleClaim)) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN,
                    "forbidden", "To konto nie ma uprawnień administratora.");
            return;
        }

        Object idClaim = claims.get("id");
        String userId = idClaim != null
                ? String.valueOf(idClaim)
                : (claims.get("sub") != null ? String.valueOf(claims.get("sub")) : null);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                String name = cookie.getName();
                if (SESSION_COOKIE_INSECURE.equals(name) || SESSION_COOKIE_SECURE.equals(name)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void writeError(HttpServletResponse response, int status, String error, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + error + "\",\"message\":\"" + message + "\"}");
    }
}
