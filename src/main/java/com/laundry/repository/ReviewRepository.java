package com.laundry.repository;

import com.laundry.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByShop_ShopId(Integer shopId);
}
