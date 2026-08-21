package com.example.trafo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long stock;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    /** Cena przed promocją (opcjonalna) */
    private BigDecimal oldPrice;

    /** Kategoria produktu (np. Agregaty, Transformatory) */
    private String category;

    /** Podkategoria produktu (np. inwerterowe, gazowe) */
    private String subcategory;

    /** Kod magazynowy SKU */
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "product_parameters", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "parameter_key")
    @Column(name = "parameter_value")
    private Map<String, String> parameters;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    // Konstruktory (wymagane przez Hibernate)
    public Product() {}

    public Product(String name, BigDecimal price) {
        this.name = name;
        this.price = price;
    }

    // Gettery i settery
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getOldPrice() { return oldPrice; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Long getStock() { return stock; }
    public void setStock(Long stock) { this.stock = stock; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public Map<String, String> getParameters() {
        return parameters;
    }

    public void setParameters(Map<String, String> parameters) {
        this.parameters = parameters;
    }
}