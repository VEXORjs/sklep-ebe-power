package com.example.trafo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@RestController
@EnableAsync
public class TrafoApplication {

    private final ProductRepository productRepository;

    public TrafoApplication(ProductRepository productRepository){
        this.productRepository = productRepository;
    }

	public static void main(String[] args) {
		SpringApplication.run(TrafoApplication.class, args);
	}

    @Bean
    public CommandLineRunner initDatabase(ProductRepository productRepository){
        return args -> {
            if(productRepository.count() == 0){
                productRepository.save(new Product("mieczyk", new java.math.BigDecimal("2100.00")));
                productRepository.save(new Product("Detektor anomalii S.T.A.L.K.E.R.", new java.math.BigDecimal("1850.00")));
                System.out.println(">>> Baza danych była pusta. Dodano produkty startowe!");
            }
        };
    }

}
