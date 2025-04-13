package com.laundry.repository.admin;

import com.laundry.model.admin.AdminSecurityLog;
import com.laundry.model.admin.enums.AdminSecurityAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminSecurityLogRepository extends JpaRepository<AdminSecurityLog, Long> {
    List<AdminSecurityLog> findTop10ByOrderByTimestampDesc();
    List<AdminSecurityLog> findByActionTypeAndTimestampBetween(
        AdminSecurityAction actionType, LocalDateTime start, LocalDateTime end);
    List<AdminSecurityLog> findByUsernameAndSuccessful(String username, boolean successful);
} 