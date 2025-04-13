package com.laundry.model.admin;

import com.laundry.model.admin.enums.AdminSecurityAction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_security_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSecurityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String action;
    private String userIp;
    private String username;
    private LocalDateTime timestamp;
    private boolean successful;
    private String details;
    
    @Enumerated(EnumType.STRING)
    private AdminSecurityAction actionType;
} 