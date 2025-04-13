package com.laundry.controller.staff;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpSession;
import com.laundry.model.User;
import com.laundry.service.UserService;

@Controller
@RequestMapping("/staff")
public class StaffViewController {

    @Autowired
    private UserService userService;

    @GetMapping("")
    public String getStaffDashboard(Model model, HttpSession session) {
        // Kiểm tra session
        User user = (User) session.getAttribute("user");
        if (user == null) {
            // Tạm thời tạo user mẫu cho test
            user = new User();
            user.setFullName("Nhân viên");
            user.setEmail("staff@example.com");
            user.setRole("Staff");
            session.setAttribute("user", user);
        }

        // Thêm các thông tin thống kê
        model.addAttribute("todayOrders", 15);
        model.addAttribute("completedOrders", 12);
        model.addAttribute("processingOrders", 3);
        model.addAttribute("rating", 4.8);

        return "admin/staff";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
} 