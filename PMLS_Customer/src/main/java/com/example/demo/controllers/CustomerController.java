package com.example.demo.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CustomerController {

    // Localhost:8083
    @GetMapping("/")
    public String home() {
        return "customer"; // Trả về template customer.html
    }

    // Localhost:8083/customer
    @GetMapping("/customer")
    public String customer() {
        return "customer"; // Trả về template customer.html
    }
}
