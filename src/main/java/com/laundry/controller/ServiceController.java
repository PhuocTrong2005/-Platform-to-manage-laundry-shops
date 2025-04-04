package com.laundry.controller;

import com.laundry.model.Service;
import com.laundry.service.LaundryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(ServiceController.class);
    
    @Autowired
    private LaundryService laundryService;
    
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        try {
            logger.info("Attempting to retrieve all services");
            List<Service> services = laundryService.getAllServices();
            logger.info("Successfully retrieved {} services", services.size());
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            logger.error("Error retrieving services: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<Service>> getServicesByShopId(@PathVariable Long shopId) {
        try {
            logger.info("Attempting to retrieve services for shop ID: {}", shopId);
            List<Service> services = laundryService.getServicesByShopId(shopId);
            logger.info("Successfully retrieved {} services for shop ID: {}", services.size(), shopId);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            logger.error("Error retrieving services for shop ID {}: ", shopId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        try {
            logger.info("Attempting to create new service: {}", service);
            Service createdService = laundryService.createService(service);
            logger.info("Successfully created service with ID: {}", createdService.getId());
            return ResponseEntity.ok(createdService);
        } catch (Exception e) {
            logger.error("Error creating service: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service service) {
        try {
            logger.info("Attempting to update service with ID: {}", id);
            Service updatedService = laundryService.updateService(id, service);
            if (updatedService != null) {
                logger.info("Successfully updated service with ID: {}", id);
                return ResponseEntity.ok(updatedService);
            }
            logger.warn("Service with ID {} not found", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating service with ID {}: ", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        try {
            logger.info("Attempting to delete service with ID: {}", id);
            laundryService.deleteService(id);
            logger.info("Successfully deleted service with ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: ", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 