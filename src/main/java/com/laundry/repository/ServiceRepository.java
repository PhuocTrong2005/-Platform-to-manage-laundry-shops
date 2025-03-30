package com.laundry.repository;

import com.laundry.models.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Integer> {
    List<Service> findByShop_ShopId(Integer shopId);
}
