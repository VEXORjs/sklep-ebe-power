package com.example.trafo;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public String verifyTokenAndGetUserId(String token) {
        if (token == null || !token.contains(".")) {
            return token; // Zwracamy bezpośrednio przekazane ID ("1")
        }
        try {
            // NextAuth domyślnie podpisuje tokeny algorytmem HMAC256 przy użyciu naszego sekretu
            Algorithm algorithm = Algorithm.HMAC256(secret);

            DecodedJWT jwt = JWT.require(algorithm)
                    .build()
                    .verify(token); // Tutaj rzuci wyjątek, jeśli ktoś sfałszował token

            // NextAuth często zapisuje id użytkownika w polu "id" lub "sub" (subject)
            // Na potrzeby testu sprawdzamy claim "id", jeśli jest pusty - bierzemy "sub"
            if (jwt.getClaim("id").isNull()) {
                return jwt.getSubject();
            }
            return jwt.getClaim("id").asString();

        } catch (Exception e) {
            // Token wygasł, ma zły podpis lub jest uszkodzony
            return null;
        }
    }
}