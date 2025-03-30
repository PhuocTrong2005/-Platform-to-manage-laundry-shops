package com.laundry.repository;

import com.laundry.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByOrder_OrderId(Integer orderId);
}
