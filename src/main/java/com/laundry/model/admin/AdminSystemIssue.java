package com.laundry.model.admin;

import com.laundry.model.admin.enums.AdminIssueStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_system_issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSystemIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private LocalDateTime detectedTime;
    private LocalDateTime resolvedTime;
    
    @Enumerated(EnumType.STRING)
    private AdminIssueStatus status;
    
    private String severity;
    private String affectedArea;
} 