package com.laundry.repository;

import com.laundry.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Integer customerId);
    List<Order> findByShopId(Long shopId);
    List<Order> findByStatus(String status);
    List<Order> findByShopIdAndStatus(Long shopId, String status);
} 