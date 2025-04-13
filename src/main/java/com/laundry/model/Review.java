package com.laundry.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Reviews")
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReviewID")
    private Long id;
    
    @Column(name = "Rating", nullable = false)
    private Integer rating;
    
    @Column(name = "Comment", nullable = false, length = 1000)
    private String comment;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CustomerID", nullable = false)
    private User customer;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ShopID", nullable = false)
    private Shop shop;
    
    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReviewImage> images = new ArrayList<>();
    
    // Constructor 
    public Review() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public User getCustomer() {
        return customer;
    }
    
    public void setCustomer(User customer) {
        this.customer = customer;
    }
    
    public Shop getShop() {
        return shop;
    }
    
    public void setShop(Shop shop) {
        this.shop = shop;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<ReviewImage> getImages() {
        return images;
    }
    
    public void setImages(List<ReviewImage> images) {
        this.images = images;
    }
    
    // Helper methods
    public void addImage(ReviewImage image) {
        images.add(image);
        image.setReview(this);
    }
    
    public void removeImage(ReviewImage image) {
        images.remove(image);
        image.setReview(null);
    }

    @Override
    public String toString() {
        return "Review{" +
                "id=" + id +
                ", rating=" + rating +
                ", comment='" + comment + '\'' +
                ", customerId=" + (customer != null ? customer.getUserId() : null) +
                ", shopId=" + (shop != null ? shop.getId() : null) +
                ", createdAt=" + createdAt +
                ", images=" + images.size() +
                '}';
    }
} 