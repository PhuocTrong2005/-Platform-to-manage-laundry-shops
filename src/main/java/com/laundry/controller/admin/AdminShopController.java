package com.laundry.controller.admin;

import com.laundry.model.admin.AdminShop;
import com.laundry.service.admin.AdminShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminShopController {

    @Autowired
    private AdminShopService adminShopService;

    @GetMapping("/shops")
    public String getShopManagementPage(Model model) {
        List<AdminShop> shops = adminShopService.getAllShops();
        model.addAttribute("shops", shops);
        model.addAttribute("totalShops", shops.size());
        model.addAttribute("activeShops", shops.size()); // Assuming all shops are active for now
        model.addAttribute("newRegistrations", 0); // This would be implemented based on your requirements
        return "admin/sections/shop-management";
    }

    @GetMapping("/api/shops")
    @ResponseBody
    public ResponseEntity<List<AdminShop>> getAllShops() {
        return ResponseEntity.ok(adminShopService.getAllShops());
    }

    @GetMapping("/api/shops/{id}")
    @ResponseBody
    public ResponseEntity<AdminShop> getShopById(@PathVariable Long id) {
        return adminShopService.getShopById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/shops")
    @ResponseBody
    public ResponseEntity<AdminShop> createShop(@RequestBody AdminShop shop) {
        try {
            AdminShop createdShop = adminShopService.createShop(shop);
            return ResponseEntity.ok(createdShop);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/api/shops/{id}")
    @ResponseBody
    public ResponseEntity<Void> updateShop(@PathVariable Long id, @RequestBody AdminShop shop) {
        boolean updated = adminShopService.updateShop(id, shop);
        return updated ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/shops/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteShop(@PathVariable Long id) {
        boolean deleted = adminShopService.deleteShop(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
} 