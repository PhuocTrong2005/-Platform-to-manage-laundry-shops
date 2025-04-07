package com.laundry.repository;

import com.laundry.model.LaundryShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LaundryShopRepository extends JpaRepository<LaundryShop, Long> {
}