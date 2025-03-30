package com.laundry.repository;

import com.laundry.models.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StaffRepository extends JpaRepository<Staff, Integer> {
    List<Staff> findByShop_ShopId(Integer shopId);
}
