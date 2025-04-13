package com.laundry.service;

import com.laundry.dto.ReviewDTO;
import com.laundry.model.Review;
import com.laundry.model.ReviewImage;
import com.laundry.model.Shop;
import com.laundry.model.User;
import com.laundry.repository.ReviewRepository;
import com.laundry.repository.ShopRepository;
import com.laundry.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ShopRepository shopRepository;
    
    /**
     * Lấy tất cả đánh giá
     */
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy đánh giá theo ID
     */
    public ReviewDTO getReviewById(Long id) {
        return reviewRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + id));
    }
    
    /**
     * Lấy đánh giá theo cửa hàng
     */
    public List<ReviewDTO> getReviewsByShopId(Long shopId) {
        return reviewRepository.findByShopIdOrderByCreatedAtDesc(shopId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy đánh giá theo khách hàng
     */
    public List<ReviewDTO> getReviewsByCustomerId(Integer customerId) {
        return reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Tạo đánh giá mới
     */
    @Transactional
    public ReviewDTO createReview(ReviewDTO reviewDTO) {
        logger.info("Tạo đánh giá mới từ khách hàng: {}", reviewDTO.getCustomerId());
        
        // Validate
        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new IllegalArgumentException("Đánh giá phải từ 1 đến 5 sao");
        }
        
        if (reviewDTO.getComment() == null || reviewDTO.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung đánh giá không được để trống");
        }
        
        // Tìm khách hàng
        User customer = userRepository.findById(reviewDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + reviewDTO.getCustomerId()));
        
        // Tìm cửa hàng
        Shop shop = shopRepository.findById(reviewDTO.getShopId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng ID: " + reviewDTO.getShopId()));
        
        // Tạo đánh giá mới
        Review review = new Review();
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setCustomer(customer);
        review.setShop(shop);
        review.setCreatedAt(LocalDateTime.now());
        
        // Lưu đánh giá
        Review savedReview = reviewRepository.save(review);
        
        // Xử lý ảnh nếu có
        if (reviewDTO.getImages() != null && !reviewDTO.getImages().isEmpty()) {
            for (ReviewDTO.ReviewImageDTO imageDTO : reviewDTO.getImages()) {
                ReviewImage image = new ReviewImage();
                image.setImageUrl(imageDTO.getImageUrl());
                image.setReview(savedReview);
                savedReview.getImages().add(image);
            }
            
            // Lưu lại sau khi thêm ảnh
            savedReview = reviewRepository.save(savedReview);
        }
        
        logger.info("Đã tạo đánh giá mới với ID: {}", savedReview.getId());
        return convertToDTO(savedReview);
    }
    
    /**
     * Cập nhật đánh giá
     */
    @Transactional
    public ReviewDTO updateReview(Long id, ReviewDTO reviewDTO) {
        logger.info("Cập nhật đánh giá ID: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá ID: " + id));
        
        // Validate
        if (reviewDTO.getRating() != null) {
            if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
                throw new IllegalArgumentException("Đánh giá phải từ 1 đến 5 sao");
            }
            review.setRating(reviewDTO.getRating());
        }
        
        if (reviewDTO.getComment() != null) {
            if (reviewDTO.getComment().trim().isEmpty()) {
                throw new IllegalArgumentException("Nội dung đánh giá không được để trống");
            }
            review.setComment(reviewDTO.getComment());
        }
        
        // Lưu đánh giá sau khi cập nhật
        Review updatedReview = reviewRepository.save(review);
        
        logger.info("Đã cập nhật đánh giá ID: {}", updatedReview.getId());
        return convertToDTO(updatedReview);
    }
    
    /**
     * Xóa đánh giá
     */
    @Transactional
    public void deleteReview(Long id) {
        logger.info("Xóa đánh giá ID: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá ID: " + id));
        
        reviewRepository.delete(review);
        logger.info("Đã xóa đánh giá ID: {}", id);
    }
    
    /**
     * Chuyển đổi Entity sang DTO
     */
    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setShopId(review.getShop().getId());
        dto.setCustomerId(review.getCustomer().getUserId());
        dto.setCustomerName(review.getCustomer().getFullName());
        dto.setCreatedAt(review.getCreatedAt());
        
        // Chuyển đổi ảnh
        List<ReviewDTO.ReviewImageDTO> imageDTOs = new ArrayList<>();
        for (ReviewImage image : review.getImages()) {
            ReviewDTO.ReviewImageDTO imageDTO = new ReviewDTO.ReviewImageDTO();
            imageDTO.setId(image.getId());
            imageDTO.setImageUrl(image.getImageUrl());
            imageDTOs.add(imageDTO);
        }
        dto.setImages(imageDTOs);
        
        return dto;
    }
    
    /**
     * Tính điểm đánh giá trung bình của cửa hàng
     */
    public Double getAverageRatingByShopId(Long shopId) {
        return reviewRepository.getAverageRatingByShopId(shopId);
    }
    
    /**
     * Đếm số lượng đánh giá của cửa hàng
     */
    public long countReviewsByShopId(Long shopId) {
        return reviewRepository.countByShopId(shopId);
    }
} 