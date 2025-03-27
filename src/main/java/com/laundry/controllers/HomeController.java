package com.laundry.controllers;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController
{
// Localhost:8080 
@RequestMapping("/")
public String home() {
	return "admin/index";
}

// Localhost:8080/index
@RequestMapping("/index")
public String index() {
	return "admin/index";  // Trả về file index.html
}

@RequestMapping("/login")
public String login() {
	return "admin/login";  // Trả về file 
}

// Localhost:8080/register
@RequestMapping("/register")
public String register() {
	return "admin/register";  // Trả về file 
}

// Localhost:8080/loginRole
@RequestMapping("/loginRole")
public String loginRole() {
    return  "admin/loginRole";
}

// Localhost:8080/customer
@RequestMapping("/customer")
public String customer() {
    return  "admin/customer";
}
}

