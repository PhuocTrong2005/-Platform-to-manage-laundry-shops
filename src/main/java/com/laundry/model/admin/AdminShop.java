package com.laundry.model.admin;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.laundry.model.admin.enums.AdminShopStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminShop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShopID")
    private Long id;
    
    @Column(name = "ShopName")
    private String name;
    
    @Column(name = "OwnerID")
    private Long ownerId;
    
    @Transient
    private String ownerName;
    
    @Column(name = "Location")
    private String location;
    
    @Column(name = "ServicesOffered")
    private String services;
    
    @Column(name = "OperatingHours")
    private String operatingHours;
    
    @Enumerated(EnumType.STRING)
    private AdminShopStatus status = AdminShopStatus.ACTIVE;
    
    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 