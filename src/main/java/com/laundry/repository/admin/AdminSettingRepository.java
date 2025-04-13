package com.laundry.repository.admin;

import com.laundry.model.admin.AdminSetting;
import com.laundry.model.admin.enums.AdminSettingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminSettingRepository extends JpaRepository<AdminSetting, Long> {
    Optional<AdminSetting> findBySettingKey(String key);
    List<AdminSetting> findByType(AdminSettingType type);
    List<AdminSetting> findByCategory(String category);
} 