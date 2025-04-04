package com.laundry.controllers;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class customerController {
    
    @RequestMapping("/customer")
    public String customer() {  
        return "admin/customer";
    }
}
