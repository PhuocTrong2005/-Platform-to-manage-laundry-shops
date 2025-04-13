package com.laundry.model.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_dashboard_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String statName;
    private Double value;
    private LocalDateTime timestamp;
    private String category;
    private Double previousValue;
    private Double changePercentage;
    private String timeRange;
} 