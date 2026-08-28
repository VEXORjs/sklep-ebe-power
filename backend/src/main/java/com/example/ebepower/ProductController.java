package com.example.ebepower;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"https://frontend-1078992546635.europe-west1.run.app", "http://localhost:3000", "http://localhost:3001"})
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id ){
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produkt nie został znaleziony"));
    }

    @PostMapping
        public Product addProduct(@RequestBody Product product){
            System.out.println("Odebrane zdjęcia: " + product.getImages());
            return productRepository.save(product);
         }

    @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteProduct(@PathVariable Long id){
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        else {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
    }

    @PutMapping("/{id}")
        public ResponseEntity<?> putProduct(@PathVariable Long id, @RequestBody Product productDetails){
            if (!productRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            else {
                Product existingProduct = productRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Produkt nie istnieje dla id: " + id));
                existingProduct.setName(productDetails.getName());
                existingProduct.setPrice(productDetails.getPrice());
                existingProduct.setOldPrice(productDetails.getOldPrice());
                if (productDetails.getStock() != null) {
                    existingProduct.setStock(productDetails.getStock());
                }
                existingProduct.setCategory(productDetails.getCategory());
                existingProduct.setSubcategory(productDetails.getSubcategory());
                existingProduct.setSku(productDetails.getSku());
                existingProduct.setDescription(productDetails.getDescription());
                existingProduct.setImages(productDetails.getImages());
                if (productDetails.getParameters() != null) {
                    existingProduct.setParameters(productDetails.getParameters());
                }

                Product savedProduct = productRepository.save(existingProduct);
                return ResponseEntity.ok(savedProduct);
            }
        }
}
