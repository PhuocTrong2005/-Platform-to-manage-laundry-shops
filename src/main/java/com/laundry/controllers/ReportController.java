package com.laundry.controllers;

import com.laundry.model.LaundryShop;
import com.laundry.model.Order;
import com.laundry.model.User;
import com.laundry.repository.LaundryShopRepository;
import com.laundry.repository.OrderRepository;
import com.laundry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class ReportController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private LaundryShopRepository laundryShopRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/report/view") // Đổi tên đường dẫn để tránh xung đột
    public String getReport(Model model) {
        List<Order> orders = orderRepository.findAll();
        List<LaundryShop> shops = laundryShopRepository.findAll();
        List<User> users = userRepository.findAll();

        model.addAttribute("orders", orders);
        model.addAttribute("shops", shops);
        model.addAttribute("users", users);

        return "admin/report"; // Tên tệp HTML
    }
}