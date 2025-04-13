package com.laundry.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReviewDTO {
    private Long id;
    private Integer rating;
    private String comment;
    private Long shopId;
    private Integer customerId;
    private String customerName;
    private LocalDateTime createdAt;
    private List<ReviewImageDTO> images = new ArrayList<>();
    
    // Constructors
    public ReviewDTO() {}
    
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
    
    public Long getShopId() {
        return shopId;
    }
    
    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }
    
    public Integer getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<ReviewImageDTO> getImages() {
        return images;
    }
    
    public void setImages(List<ReviewImageDTO> images) {
        this.images = images;
    }
    
    // Helper class for review images
    public static class ReviewImageDTO {
        private Long id;
        private String imageUrl;
        
        public ReviewImageDTO() {}
        
        public ReviewImageDTO(Long id, String imageUrl) {
            this.id = id;
            this.imageUrl = imageUrl;
        }
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getImageUrl() {
            return imageUrl;
        }
        
        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
} 