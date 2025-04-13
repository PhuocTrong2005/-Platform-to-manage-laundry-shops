package com.laundry.model.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String metricName;
    private Double value;
    private LocalDateTime timestamp;
    private String category;
    private String description;
} 