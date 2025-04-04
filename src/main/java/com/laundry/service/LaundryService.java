package com.laundry.service;

import com.laundry.model.Service;
import com.laundry.repository.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class LaundryService {
    
    private static final Logger logger = LoggerFactory.getLogger(LaundryService.class);
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    public List<com.laundry.model.Service> getAllServices() {
        try {
            logger.info("Retrieving all services from database");
            List<com.laundry.model.Service> services = serviceRepository.findAll();
            logger.info("Found {} services", services.size());
            return services;
        } catch (Exception e) {
            logger.error("Error retrieving all services: ", e);
            throw e;
        }
    }
    
    public List<com.laundry.model.Service> getServicesByShopId(Long shopId) {
        try {
            logger.info("Retrieving services for shop ID: {}", shopId);
            List<com.laundry.model.Service> services = serviceRepository.findByShopId(shopId);
            logger.info("Found {} services for shop ID: {}", services.size(), shopId);
            return services;
        } catch (Exception e) {
            logger.error("Error retrieving services for shop ID {}: ", shopId, e);
            throw e;
        }
    }
    
    public com.laundry.model.Service createService(com.laundry.model.Service service) {
        try {
            logger.info("Creating new service: {}", service);
            service.setCreatedAt(LocalDateTime.now());
            com.laundry.model.Service savedService = serviceRepository.save(service);
            logger.info("Successfully created service with ID: {}", savedService.getId());
            return savedService;
        } catch (Exception e) {
            logger.error("Error creating service: ", e);
            throw e;
        }
    }
    
    public com.laundry.model.Service updateService(Long id, com.laundry.model.Service service) {
        try {
            logger.info("Updating service with ID: {}", id);
            Optional<com.laundry.model.Service> existingService = serviceRepository.findById(id);
            if (existingService.isPresent()) {
                com.laundry.model.Service updatedService = existingService.get();
                updatedService.setServiceName(service.getServiceName());
                updatedService.setPrice(service.getPrice());
                com.laundry.model.Service savedService = serviceRepository.save(updatedService);
                logger.info("Successfully updated service with ID: {}", id);
                return savedService;
            }
            logger.warn("Service with ID {} not found", id);
            return null;
        } catch (Exception e) {
            logger.error("Error updating service with ID {}: ", id, e);
            throw e;
        }
    }
    
    public void deleteService(Long id) {
        try {
            logger.info("Deleting service with ID: {}", id);
            serviceRepository.deleteById(id);
            logger.info("Successfully deleted service with ID: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: ", id, e);
            throw e;
        }
    }
} 