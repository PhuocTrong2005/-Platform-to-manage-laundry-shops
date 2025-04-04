package com.laundry.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Shops")
public class Shops {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shopID;

    @Column(nullable = false)
    private Integer ownerID;

    @Column(nullable = false, length = 100)
    private String shopName;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String servicesOffered;

    @Column(length = 100)
    private String operatingHours;

    @Column(name = "CreatedAt", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime CreatedAt;

    // Getters và Setters
    public Integer getShopID() {
        return shopID;
    }

    public void setShopID(Integer shopID) {
        this.shopID = shopID;
    }

    public Integer getOwnerID() {
        return ownerID;
    }

    public void setOwnerID(Integer ownerID) {
        this.ownerID = ownerID;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getServicesOffered() {
        return servicesOffered;
    }

    public void setServicesOffered(String servicesOffered) {
        this.servicesOffered = servicesOffered;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public LocalDateTime getCreatedAt() {
        return CreatedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.CreatedAt = CreatedAt;
    }
}