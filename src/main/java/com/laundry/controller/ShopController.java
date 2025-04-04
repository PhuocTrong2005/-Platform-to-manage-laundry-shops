package com.laundry.controller;

import com.laundry.model.Shop;
import com.laundry.service.ShopService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "*")
public class ShopController {
    private static final Logger logger = LoggerFactory.getLogger(ShopController.class);

    @Autowired
    private ShopService shopService;

    @GetMapping
    public ResponseEntity<List<Shop>> getAllShops() {
        try {
            logger.info("Getting all shops");
            List<Shop> shops = shopService.getAllShops();
            return ResponseEntity.ok(shops);
        } catch (Exception e) {
            logger.error("Error getting all shops", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable Long id) {
        try {
            logger.info("Getting shop with id: {}", id);
            Shop shop = shopService.getShopById(id);
            if (shop != null) {
                return ResponseEntity.ok(shop);
            } else {
                logger.warn("Shop not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting shop with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Shop> createShop(@RequestBody Shop shop) {
        try {
            logger.info("Creating new shop: {}", shop);
            Shop createdShop = shopService.createShop(shop);
            return ResponseEntity.ok(createdShop);
        } catch (Exception e) {
            logger.error("Error creating shop", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shop> updateShop(@PathVariable Long id, @RequestBody Shop shop) {
        try {
            logger.info("Updating shop with id: {}", id);
            shop.setId(id);
            Shop updatedShop = shopService.updateShop(shop);
            if (updatedShop != null) {
                return ResponseEntity.ok(updatedShop);
            } else {
                logger.warn("Shop not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating shop with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShop(@PathVariable Long id) {
        try {
            logger.info("Deleting shop with id: {}", id);
            boolean deleted = shopService.deleteShop(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                logger.warn("Shop not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting shop with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 