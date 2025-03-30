package com.laundry.service;

import com.laundry.models.Shop;
import java.util.List;
import java.util.Optional;

public interface ShopService {
    List<Shop> getAllShops();
    Optional<Shop> getShopById(Integer id);
    Shop createShop(Shop shop);
    Shop updateShop(Integer id, Shop shop);
    void deleteShop(Integer id);
}
