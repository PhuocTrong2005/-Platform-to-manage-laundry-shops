package com.laundry.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AdminController {

	@RequestMapping("/admin")
	public String admin() {
		return "admin/admin";
	}

	@GetMapping("/orders")
	public String orders() {
		return "admin/orders";
	}

	@GetMapping("/stores")
	public String stores() {
		return "admin/stores";
	}

	@GetMapping("/report")
	public String report() {
		return "admin/report";
	}
}
