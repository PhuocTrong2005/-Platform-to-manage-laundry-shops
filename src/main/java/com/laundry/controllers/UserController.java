package com.laundry.controllers;

import com.laundry.model.LoginRequest;
import com.laundry.model.RegisterRequest;
import com.laundry.model.User;
import com.laundry.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/loginRole")
    public String showLoginPage() {
        return "admin/loginRole";
    }

    @PostMapping("/api/loginRole")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        if (user != null) {
            return ResponseEntity.ok().body(user);
        }
        return ResponseEntity.badRequest().body("Invalid email or password");
    }

    @GetMapping("/admin")
    public String adminDashboard() {
        return "admin/admin";
    }

    @GetMapping("/shopOwner")
    public String shopOwnerDashboard() {
        return "admin/shopOwner";
    }

    @GetMapping("/customer")
    public String customerDashboard() {
        return "admin/customer";
    }
// users
    @GetMapping("/users")
    public String listUsers(Model model) {
        model.addAttribute("users", userService.getAllUsers());
        return "admin/users";
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "admin/register";
    }

    @PostMapping("/api/register")
    @ResponseBody
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            User existingUser = userService.getUserByEmail(registerRequest.getEmail());
            if (existingUser != null) {
                return ResponseEntity.badRequest().body("Email đã tồn tại");
            }

            User existingUserByPhone = userService.getUserByPhone(registerRequest.getPhone());
            if (existingUserByPhone != null) {
                return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại");
            }

            User newUser = new User();
            newUser.setFullName(registerRequest.getFullName());
            newUser.setEmail(registerRequest.getEmail());
            newUser.setPhone(registerRequest.getPhone());
            newUser.setPasswordHash(registerRequest.getPassword());
            newUser.setRole(registerRequest.getRole());
            newUser.setCreatedAt(LocalDateTime.now());

            User savedUser = userService.saveUser(newUser);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đăng ký thất bại: " + e.getMessage());
        }
    }
}