package com.laundry.service;

import com.laundry.models.Shop;
import com.laundry.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShopServiceImpl implements ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Override
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    @Override
    public Optional<Shop> getShopById(Integer id) {
        return shopRepository.findById(id);
    }

    @Override
    public Shop createShop(Shop shop) {
        return shopRepository.save(shop);
    }

    @Override
    public Shop updateShop(Integer id, Shop shop) {
        if (shopRepository.existsById(id)) {
            shop.setShopId(id);
            return shopRepository.save(shop);
        }
        return null;
    }

    @Override
    public void deleteShop(Integer id) {
        shopRepository.deleteById(id);
    }
}
