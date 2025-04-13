package com.laundry.model.admin;

import com.laundry.model.admin.enums.AdminNotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String content;
    private LocalDateTime scheduledTime;
    private LocalDateTime sentTime;
    private boolean sent;
    
    @Enumerated(EnumType.STRING)
    private AdminNotificationType type;
    
    private String targetAudience;
} 