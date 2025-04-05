package com.laundry.repository;

import com.laundry.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByShop_Id(Long shopId);
    List<Review> findByCustomer_UserId(Integer customerId);
} 