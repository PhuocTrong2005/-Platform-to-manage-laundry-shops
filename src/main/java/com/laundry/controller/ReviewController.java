package com.laundry.controller;

import com.laundry.model.Review;
import com.laundry.model.Shop;
import com.laundry.model.User;
import com.laundry.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<Review>> getReviewsByShopId(@PathVariable Long shopId) {
        List<Review> reviews = reviewService.getReviewsByShopId(shopId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Review>> getReviewsByCustomerId(@PathVariable Integer customerId) {
        List<Review> reviews = reviewService.getReviewsByCustomerId(customerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Review> createReview(
            @RequestParam("rating") Integer rating,
            @RequestParam("comment") String comment,
            @RequestParam("shopId") Long shopId,
            @RequestParam("customerId") Integer customerId) {
        try {
            Review review = new Review();
            review.setRating(rating);
            review.setComment(comment);
            
            // Set Shop
            Shop shop = new Shop();
            shop.setId(shopId);
            review.setShop(shop);
            
            // Set Customer
            User customer = new User();
            customer.setUserId(customerId);
            review.setCustomer(customer);
            
            Review createdReview = reviewService.createReview(review);
            return ResponseEntity.ok(createdReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestParam("rating") Integer rating,
            @RequestParam("comment") String comment) {
        try {
            Review review = reviewService.getReviewById(id)
                    .orElseThrow(() -> new RuntimeException("Review not found"));
            
            review.setRating(rating);
            review.setComment(comment);
            
            Review updatedReview = reviewService.updateReview(id, review);
            return ResponseEntity.ok(updatedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 