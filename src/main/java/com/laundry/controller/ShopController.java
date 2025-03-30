package com.laundry.controller;

import com.laundry.models.Shop;
import com.laundry.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

	@Autowired
	private ShopService shopService;

	@GetMapping
	public List<Shop> getAllShops() {
		return shopService.getAllShops();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Shop> getShopById(@PathVariable Integer id) {
		Optional<Shop> shop = shopService.getShopById(id);
		return shop.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PostMapping
	public Shop createShop(@RequestBody Shop shop) {
		return shopService.createShop(shop);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Shop> updateShop(@PathVariable Integer id, @RequestBody Shop shop) {
		Shop updatedShop = shopService.updateShop(id, shop);
		return updatedShop != null ? ResponseEntity.ok(updatedShop) : ResponseEntity.notFound().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteShop(@PathVariable Integer id) {
		shopService.deleteShop(id);
		return ResponseEntity.noContent().build();
	}
}
