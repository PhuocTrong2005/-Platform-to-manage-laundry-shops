package com.laundry.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ReviewImages", schema = "dbo")
public class ReviewImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ImageID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ReviewID", nullable = false)
    private Review review;

    @Column(name = "ImageURL", nullable = false)
    private String imageUrl;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
} 