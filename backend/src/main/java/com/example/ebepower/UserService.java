package com.example.ebepower;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User processOAuthLogin(OAuthRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            // Użytkownik istnieje – zwracamy go (można zaktualizować imię jeśli się zmieniło)
            User existingUser = userOptional.get();
            existingUser.setName(request.getName());
            return userRepository.save(existingUser);
        } else {
            // Użytkownik loguje się pierwszy raz – rejestrujemy go w PostgreSQL
            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setName(request.getName());

            // Generujemy losowe, bezpieczne hasło, którego nikt nie pozna (i tak loguje się przez OAuth)
            String randomPassword = UUID.randomUUID().toString();
            newUser.setPassword(passwordEncoder.encode(randomPassword));

            // Możesz też dodać pole w encji User: newUser.setProvider(request.getProvider());
            newUser.setRole("USER");
            return userRepository.save(newUser);
        }
    }

    public User processUser(LoginRequest loginRequest){
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            String encodedPassword = existingUser.getPassword();
            String typedPassword = loginRequest.getPassword();
            if(passwordEncoder.matches(typedPassword, encodedPassword)){
                return existingUser;
            }
            else {
                return null;
            }
        }
        return null;
    }

    public User registerUser(RegisterRequest registerRequest){
        Optional<User> userOptional = userRepository.findByEmail(registerRequest.getEmail());

        if (userOptional.isPresent()) {
            return null;
        }

        String encodedPassword = passwordEncoder.encode(registerRequest.getPassword());
        User newUser = new User();
        newUser.setName(registerRequest.getName());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(encodedPassword);
        newUser.setRole("USER");
        return userRepository.save(newUser);
    }
}