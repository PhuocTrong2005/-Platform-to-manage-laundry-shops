package com.laundry.repository;

import com.laundry.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomer_UserId(Integer customerId);
    List<Order> findByShop_ShopId(Integer shopId);
}
