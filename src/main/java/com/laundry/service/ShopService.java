package com.laundry.service;

import com.laundry.model.Shop;
import com.laundry.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {
    private static final Logger logger = LoggerFactory.getLogger(ShopService.class);

    @Autowired
    private ShopRepository shopRepository;

    public List<Shop> getAllShops() {
        logger.info("Getting all shops");
        return shopRepository.findAll();
    }

    public Shop getShopById(Long id) {
        logger.info("Getting shop with id: {}", id);
        Optional<Shop> shop = shopRepository.findById(id);
        return shop.orElse(null);
    }

    public Shop createShop(Shop shop) {
        logger.info("Creating new shop: {}", shop);
        shop.setCreatedAt(LocalDateTime.now());
        return shopRepository.save(shop);
    }

    public Shop updateShop(Shop shop) {
        logger.info("Updating shop with id: {}", shop.getId());
        if (!shopRepository.existsById(shop.getId())) {
            logger.warn("Shop not found with id: {}", shop.getId());
            return null;
        }
        return shopRepository.save(shop);
    }

    public boolean deleteShop(Long id) {
        logger.info("Deleting shop with id: {}", id);
        if (!shopRepository.existsById(id)) {
            logger.warn("Shop not found with id: {}", id);
            return false;
        }
        shopRepository.deleteById(id);
        return true;
    }
}