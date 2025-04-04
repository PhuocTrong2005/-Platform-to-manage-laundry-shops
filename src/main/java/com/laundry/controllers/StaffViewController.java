package com.laundry.controllers;

import com.laundry.model.User;
import com.laundry.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/staff")
public class StaffViewController {

    @Autowired
    private UserService userService;

    @GetMapping
    public String showStaffDashboard(Model model) {
        // TODO: Lấy thông tin user từ session/authentication
        // Tạm thời tạo user mẫu
        User user = new User();
        user.setFullName("Nhân viên mẫu");
        model.addAttribute("user", user);
        return "admin/staff";
    }
} 