package com.laundry.model.admin;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin_shop_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminShopService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private Double price;
    private boolean isActive;
    
    @ManyToOne
    @JoinColumn(name = "shop_id")
    @JsonBackReference
    private AdminShop shop;
} 