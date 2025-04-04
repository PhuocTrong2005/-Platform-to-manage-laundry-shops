package com.laundry.service;

import com.laundry.dto.StaffDTO;
import com.laundry.model.Staff;
import com.laundry.model.User;
import com.laundry.repository.StaffRepository;
import com.laundry.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffService {
    private static final Logger logger = LoggerFactory.getLogger(StaffService.class);

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private UserRepository userRepository;

    private StaffDTO convertToDTO(Staff staff) {
        StaffDTO dto = new StaffDTO();
        dto.setId(staff.getId());
        dto.setShopId(staff.getShopId());
        dto.setRole(staff.getRole());
        dto.setCreatedAt(staff.getCreatedAt());
        
        User user = staff.getUser();
        if (user != null) {
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
        }
        
        return dto;
    }

    public List<StaffDTO> getAllStaff() {
        logger.info("Getting all staff");
        return staffRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StaffDTO> getStaffByShopId(Long shopId) {
        logger.info("Getting staff for shop: {}", shopId);
        return staffRepository.findByShopId(shopId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StaffDTO getStaffById(Long id) {
        logger.info("Getting staff with id: {}", id);
        Optional<Staff> staff = staffRepository.findById(id);
        return staff.map(this::convertToDTO).orElse(null);
    }

    @Transactional
    public StaffDTO createStaff(Staff staff, User user) {
        logger.info("Creating new staff with user: {}", user);
        try {
            // Save user first
            user.setCreatedAt(LocalDateTime.now());
            user.setRole("Staff");
            User savedUser = userRepository.save(user);
            
            // Then save staff
            staff.setUser(savedUser);
            staff.setCreatedAt(LocalDateTime.now());
            Staff savedStaff = staffRepository.save(staff);
            return convertToDTO(savedStaff);
        } catch (Exception e) {
            logger.error("Error creating staff: {}", e.getMessage());
            throw e;
        }
    }

    @Transactional
    public StaffDTO updateStaff(Staff staff) {
        logger.info("Updating staff with id: {}", staff.getId());
        if (!staffRepository.existsById(staff.getId())) {
            logger.warn("Staff not found with id: {}", staff.getId());
            return null;
        }
        Staff updatedStaff = staffRepository.save(staff);
        return convertToDTO(updatedStaff);
    }

    @Transactional
    public boolean deleteStaff(Long id) {
        logger.info("Deleting staff with id: {}", id);
        if (!staffRepository.existsById(id)) {
            logger.warn("Staff not found with id: {}", id);
            return false;
        }
        staffRepository.deleteById(id);
        return true;
    }
}