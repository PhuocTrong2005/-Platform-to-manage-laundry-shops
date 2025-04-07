package com.laundry.controllers;

import com.laundry.model.LaundryShop;
import com.laundry.repository.LaundryShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/laundry-shops")
public class LaundryShopController {

    @Autowired
    private LaundryShopRepository shopRepository;

    @GetMapping
    public List<LaundryShop> getAllShops() {
        return shopRepository.findAll();
    }

    @PostMapping("/save")
    public LaundryShop saveShop(@RequestBody LaundryShop shop) {
        return shopRepository.save(shop);
    }

    @PutMapping("/update/{id}")
    public LaundryShop updateShop(@PathVariable Long id, @RequestBody LaundryShop shop) {
        shop.setId(id);
        return shopRepository.save(shop);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteShop(@PathVariable Long id) {
        shopRepository.deleteById(id);
    }
}