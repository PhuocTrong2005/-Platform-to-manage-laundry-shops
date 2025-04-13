package com.laundry.repository.admin;

import com.laundry.model.admin.AdminMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminMetricRepository extends JpaRepository<AdminMetric, Long> {
    List<AdminMetric> findByMetricNameAndTimestampBetween(
        String metricName, LocalDateTime start, LocalDateTime end);
    List<AdminMetric> findByCategory(String category);
} 