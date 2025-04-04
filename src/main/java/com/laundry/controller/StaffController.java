package com.laundry.controller;

import com.laundry.dto.StaffCreateDTO;
import com.laundry.dto.StaffDTO;
import com.laundry.model.Staff;
import com.laundry.model.User;
import com.laundry.service.StaffService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {
    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);

    @Autowired
    private StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffDTO>> getAllStaff() {
        try {
            logger.info("Getting all staff");
            List<StaffDTO> staff = staffService.getAllStaff();
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            logger.error("Error getting all staff", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<StaffDTO>> getStaffByShopId(@PathVariable Long shopId) {
        try {
            logger.info("Getting staff for shop: {}", shopId);
            List<StaffDTO> staff = staffService.getStaffByShopId(shopId);
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            logger.error("Error getting staff for shop: {}", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffDTO> getStaffById(@PathVariable Long id) {
        try {
            logger.info("Getting staff with id: {}", id);
            StaffDTO staff = staffService.getStaffById(id);
            if (staff != null) {
                return ResponseEntity.ok(staff);
            } else {
                logger.warn("Staff not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting staff with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<StaffDTO> createStaff(@RequestBody StaffCreateDTO staffDTO) {
        try {
            logger.info("Creating new staff with data: {}", staffDTO);
            
            // Create User object
            User user = new User();
            user.setFullName(staffDTO.getFullName());
            user.setEmail(staffDTO.getEmail());
            user.setPhone(staffDTO.getPhone());
            user.setPasswordHash(staffDTO.getPasswordHash());
            user.setRole("Staff");
            
            // Create Staff object
            Staff staff = new Staff();
            staff.setShopId(staffDTO.getShopId());
            staff.setRole(staffDTO.getRole());
            
            StaffDTO createdStaff = staffService.createStaff(staff, user);
            return ResponseEntity.ok(createdStaff);
        } catch (Exception e) {
            logger.error("Error creating staff", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffDTO> updateStaff(@PathVariable Long id, @RequestBody Staff staff) {
        try {
            logger.info("Updating staff with id: {}", id);
            staff.setId(id);
            StaffDTO updatedStaff = staffService.updateStaff(staff);
            if (updatedStaff != null) {
                return ResponseEntity.ok(updatedStaff);
            } else {
                logger.warn("Staff not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating staff with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        try {
            logger.info("Deleting staff with id: {}", id);
            boolean deleted = staffService.deleteStaff(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                logger.warn("Staff not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting staff with id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 