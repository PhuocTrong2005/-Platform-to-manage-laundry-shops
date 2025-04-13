package com.laundry.repository.admin;

import com.laundry.model.admin.AdminNotification;
import com.laundry.model.admin.enums.AdminNotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findBySentOrderByScheduledTimeDesc(boolean sent);
    List<AdminNotification> findByTypeAndScheduledTimeBefore(
        AdminNotificationType type, LocalDateTime time);
    List<AdminNotification> findByTargetAudience(String targetAudience);
} 