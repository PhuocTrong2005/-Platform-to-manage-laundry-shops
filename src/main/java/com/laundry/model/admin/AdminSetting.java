package com.laundry.model.admin;

import com.laundry.model.admin.enums.AdminSettingType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String settingKey;
    private String settingValue;
    private String category;
    private String description;
    private LocalDateTime lastModified;
    
    @Enumerated(EnumType.STRING)
    private AdminSettingType type;
} 