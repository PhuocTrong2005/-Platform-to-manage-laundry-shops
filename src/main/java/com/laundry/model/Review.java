package com.laundry.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReviewID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "CustomerID", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "ShopID", nullable = false)
    private Shop shop;

    @Column(name = "Rating", nullable = false)
    private Integer rating;

    @Column(name = "Comment", columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    public Long getShopId() {
        return shop != null ? shop.getId() : null;
    }

    public void setShopId(Long shopId) {
        if (shop == null) {
            shop = new Shop();
        }
        shop.setId(shopId);
    }
} 