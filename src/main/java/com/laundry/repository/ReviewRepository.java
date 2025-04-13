package com.laundry.repository;

import com.laundry.model.Review;
import com.laundry.model.Shop;
import com.laundry.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Tìm đánh giá theo cửa hàng
    List<Review> findByShopOrderByCreatedAtDesc(Shop shop);
    
    // Tìm đánh giá theo khách hàng
    List<Review> findByCustomerOrderByCreatedAtDesc(User customer);
    
    // Tìm đánh giá theo ID cửa hàng
    @Query("SELECT r FROM Review r WHERE r.shop.id = :shopId ORDER BY r.createdAt DESC")
    List<Review> findByShopIdOrderByCreatedAtDesc(@Param("shopId") Long shopId);
    
    // Tìm đánh giá theo ID khách hàng
    @Query("SELECT r FROM Review r WHERE r.customer.userId = :customerId ORDER BY r.createdAt DESC")
    List<Review> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Integer customerId);
    
    // Tính điểm đánh giá trung bình của cửa hàng
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.shop.id = :shopId")
    Double getAverageRatingByShopId(@Param("shopId") Long shopId);
    
    // Đếm số lượng đánh giá theo cửa hàng
    @Query("SELECT COUNT(r) FROM Review r WHERE r.shop.id = :shopId")
    long countByShopId(@Param("shopId") Long shopId);
    
    // Đếm số lượng đánh giá theo khách hàng
    @Query("SELECT COUNT(r) FROM Review r WHERE r.customer.userId = :customerId")
    long countByCustomerId(@Param("customerId") Integer customerId);
    
    // Tìm đánh giá được tạo gần đây nhất
    List<Review> findTop10ByOrderByCreatedAtDesc();
    
    // Tìm đánh giá theo số sao
    List<Review> findByRating(Integer rating);
} 