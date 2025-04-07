package com.laundry.service;

import com.laundry.model.LaundryShop;
import com.laundry.repository.LaundryShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaundryShopService {

    @Autowired
    private LaundryShopRepository laundryShopRepository;

    public LaundryShop saveShop(LaundryShop shop) {
        return laundryShopRepository.save(shop);
    }

    public void deleteShop(Long id) {
        laundryShopRepository.deleteById(id);
    }

    public LaundryShop getShopById(Long id) {
        return laundryShopRepository.findById(id).orElse(null);
    }

    public List<LaundryShop> getAllShops() {
        return laundryShopRepository.findAll();
    }
}