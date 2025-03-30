package com.laundry.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Shops")
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shopId;

    @ManyToOne
    @JoinColumn(name = "ownerId", nullable = false)
    private User owner;

    @Column(nullable = false, unique = true, length = 100)
    private String shopName;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String servicesOffered;

    @Column(length = 100)
    private String operatingHours;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ✅ Thêm getter và setter cho shopId
    public Integer getShopId() {
        return shopId;
    }

    public void setShopId(Integer shopId) {
        this.shopId = shopId;
    }

    // (Bạn có thể thêm getter & setter cho các trường khác nếu cần)
}
