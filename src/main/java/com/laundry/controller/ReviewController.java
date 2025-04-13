package com.laundry.controller;

import com.laundry.dto.ReviewDTO;
import com.laundry.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);
    
    @Autowired
    private ReviewService reviewService;
    
    /**
     * Lấy tất cả đánh giá
     */
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        try {
            logger.info("Lấy tất cả đánh giá");
            List<ReviewDTO> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy tất cả đánh giá", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Lấy đánh giá theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        try {
            logger.info("Lấy đánh giá với ID: {}", id);
            ReviewDTO review = reviewService.getReviewById(id);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy đánh giá với ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Lấy đánh giá theo cửa hàng
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByShopId(@PathVariable Long shopId) {
        try {
            logger.info("Lấy đánh giá của cửa hàng ID: {}", shopId);
            List<ReviewDTO> reviews = reviewService.getReviewsByShopId(shopId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy đánh giá của cửa hàng ID: {}", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Lấy đánh giá theo khách hàng
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByCustomerId(@PathVariable Integer customerId) {
        try {
            logger.info("Lấy đánh giá của khách hàng ID: {}", customerId);
            List<ReviewDTO> reviews = reviewService.getReviewsByCustomerId(customerId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy đánh giá của khách hàng ID: {}", customerId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Tạo đánh giá mới
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            logger.info("Tạo đánh giá mới - Debug info: {}", reviewDTO);
            
            // Kiểm tra dữ liệu
            if (reviewDTO.getRating() == null) {
                logger.warn("Lỗi xác thực: Số sao đánh giá không được để trống");
                return ResponseEntity.badRequest().body("Số sao đánh giá không được để trống");
            }
            
            if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                logger.warn("Lỗi xác thực: Số sao đánh giá phải từ 1-5");
                return ResponseEntity.badRequest().body("Số sao đánh giá phải từ 1-5");
            }
            
            if (reviewDTO.getComment() == null || reviewDTO.getComment().trim().isEmpty()) {
                logger.warn("Lỗi xác thực: Nội dung đánh giá không được để trống");
                return ResponseEntity.badRequest().body("Nội dung đánh giá không được để trống");
            }
            
            if (reviewDTO.getShopId() == null) {
                logger.warn("Lỗi xác thực: ID cửa hàng không được để trống");
                return ResponseEntity.badRequest().body("ID cửa hàng không được để trống");
            }
            
            if (reviewDTO.getCustomerId() == null) {
                logger.warn("Lỗi xác thực: ID khách hàng không được để trống");
                return ResponseEntity.badRequest().body("ID khách hàng không được để trống");
            }
            
            // Gọi service để tạo đánh giá
            ReviewDTO createdReview = reviewService.createReview(reviewDTO);
            logger.info("Đã tạo đánh giá mới với ID: {}", createdReview.getId());
            
            return ResponseEntity.ok(createdReview);
        } catch (IllegalArgumentException e) {
            logger.warn("Lỗi xác thực khi tạo đánh giá: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi khi tạo đánh giá mới", e);
            return ResponseEntity.internalServerError().body("Lỗi khi tạo đánh giá: " + e.getMessage());
        }
    }
    
    /**
     * Cập nhật đánh giá
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewDTO reviewDTO) {
        try {
            logger.info("Cập nhật đánh giá ID: {}", id);
            ReviewDTO updatedReview = reviewService.updateReview(id, reviewDTO);
            return ResponseEntity.ok(updatedReview);
        } catch (IllegalArgumentException e) {
            logger.warn("Lỗi xác thực khi cập nhật đánh giá: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật đánh giá ID: {}", id, e);
            return ResponseEntity.internalServerError().body("Lỗi khi cập nhật đánh giá: " + e.getMessage());
        }
    }
    
    /**
     * Xóa đánh giá
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            logger.info("Xóa đánh giá ID: {}", id);
            reviewService.deleteReview(id);
            return ResponseEntity.ok().body("Đã xóa đánh giá thành công");
        } catch (Exception e) {
            logger.error("Lỗi khi xóa đánh giá ID: {}", id, e);
            return ResponseEntity.internalServerError().body("Lỗi khi xóa đánh giá: " + e.getMessage());
        }
    }
    
    /**
     * Lấy điểm đánh giá trung bình của cửa hàng
     */
    @GetMapping("/shop/{shopId}/rating")
    public ResponseEntity<?> getAverageRatingByShopId(@PathVariable Long shopId) {
        try {
            logger.info("Lấy điểm đánh giá trung bình của cửa hàng ID: {}", shopId);
            Double averageRating = reviewService.getAverageRatingByShopId(shopId);
            return ResponseEntity.ok(averageRating != null ? averageRating : 0.0);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy điểm đánh giá trung bình của cửa hàng ID: {}", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Lấy số lượng đánh giá của cửa hàng
     */
    @GetMapping("/shop/{shopId}/count")
    public ResponseEntity<?> getReviewCountByShopId(@PathVariable Long shopId) {
        try {
            logger.info("Lấy số lượng đánh giá của cửa hàng ID: {}", shopId);
            long count = reviewService.countReviewsByShopId(shopId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy số lượng đánh giá của cửa hàng ID: {}", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 