package com.laundry.service;

import com.laundry.dto.OrderDTO;
import com.laundry.dto.OrderItemDTO;
import com.laundry.dto.OrderStatusUpdateDTO;
import com.laundry.model.Order;
import com.laundry.model.OrderItem;
import com.laundry.repository.OrderItemRepository;
import com.laundry.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    public List<OrderDTO> getAllOrders() {
        logger.info("Getting all orders");
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public OrderDTO getOrderById(Long id) {
        logger.info("Getting order with id: {}", id);
        return orderRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }
    
    public List<OrderDTO> getOrdersByCustomerId(Integer customerId) {
        logger.info("Getting orders for customer: {}", customerId);
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<OrderDTO> getOrdersByShopId(Long shopId) {
        logger.info("Getting orders for shop: {}", shopId);
        List<Order> orders = orderRepository.findByShopId(shopId);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<OrderDTO> getOrdersByStatus(String status) {
        logger.info("Getting orders with status: {}", status);
        List<Order> orders = orderRepository.findByStatus(status);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        logger.info("Creating new order for customer: {}", orderDTO.getCustomerName());
        
        try {
            // Create new order entity
            Order order = new Order();
            
            // Validate and set customer info
            if (orderDTO.getCustomerId() == null) {
                throw new IllegalArgumentException("Customer ID cannot be null");
            }
            order.setCustomerId(orderDTO.getCustomerId().intValue());
            order.setShopId(orderDTO.getShopId());
            order.setCustomerName(orderDTO.getCustomerName());
            order.setCustomerPhone(orderDTO.getCustomerPhone());
            order.setDeliveryAddress(orderDTO.getDeliveryAddress());
            order.setPickupDate(orderDTO.getPickupDate());
            order.setPickupTime(orderDTO.getPickupTime());
            order.setNotes(orderDTO.getNotes());
            order.setStatus("Mới"); // Default status for new orders
            
            // Set financial details with defaults if null
            order.setTotalAmount(orderDTO.getTotalAmount() != null ? orderDTO.getTotalAmount() : BigDecimal.ZERO);
            order.setDeliveryFee(orderDTO.getDeliveryFee() != null ? orderDTO.getDeliveryFee() : BigDecimal.ZERO);
            
            // Calculate grand total
            BigDecimal grandTotal = BigDecimal.ZERO;
            if (orderDTO.getGrandTotal() != null) {
                grandTotal = orderDTO.getGrandTotal();
            } else if (orderDTO.getTotalAmount() != null) {
                grandTotal = orderDTO.getTotalAmount();
                if (orderDTO.getDeliveryFee() != null) {
                    grandTotal = grandTotal.add(orderDTO.getDeliveryFee());
                }
            }
            order.setGrandTotal(grandTotal);
            
            // Set other details
            order.setPaymentMethod(orderDTO.getPaymentMethod());
            order.setCreatedAt(LocalDateTime.now());
            
            // Save order first to get the order ID
            logger.debug("Saving order...");
            Order savedOrder = orderRepository.save(order);
            logger.debug("Order saved with ID: {}", savedOrder.getId());
            
            // Create and save order items
            List<OrderItem> orderItems = new ArrayList<>();
            if (orderDTO.getItems() != null) {
                logger.debug("Processing {} order items", orderDTO.getItems().size());
                for (OrderItemDTO itemDTO : orderDTO.getItems()) {
                    OrderItem item = new OrderItem();
                    item.setOrder(savedOrder);
                    item.setServiceId(itemDTO.getServiceId());
                    item.setName(itemDTO.getServiceName());
                    item.setQuantity(itemDTO.getQuantity());
                    item.setPrice(BigDecimal.valueOf(itemDTO.getPrice()));
                    orderItems.add(item);
                    logger.debug("Added item: {}, quantity: {}, price: {}", 
                        itemDTO.getServiceName(), itemDTO.getQuantity(), itemDTO.getPrice());
                }
            }
            
            savedOrder.setItems(orderItems);
            logger.debug("Saving order with items...");
            Order finalSavedOrder = orderRepository.save(savedOrder);
            logger.info("Order saved successfully with ID: {}", finalSavedOrder.getId());
            
            return convertToDTO(finalSavedOrder);
        } catch (Exception e) {
            logger.error("Error creating order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public OrderDTO updateOrderStatus(Long id, OrderStatusUpdateDTO statusUpdate) {
        logger.info("Updating status for order {}: {}", id, statusUpdate.getStatus());
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        
        order.setStatus(statusUpdate.getStatus());
        Order updatedOrder = orderRepository.save(order);
        
        return convertToDTO(updatedOrder);
    }
    
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomerId().longValue());
        dto.setShopId(order.getShopId());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setPickupDate(order.getPickupDate());
        dto.setPickupTime(order.getPickupTime());
        dto.setNotes(order.getNotes());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setGrandTotal(order.getGrandTotal());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setCreatedAt(order.getCreatedAt());
        
        // Format date for display
        if (order.getCreatedAt() != null) {
            dto.setDate(order.getCreatedAt().format(DATE_FORMATTER));
        }
        
        // Convert and set order items
        if (order.getItems() != null) {
            List<OrderItemDTO> itemDTOs = order.getItems().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }
        
        return dto;
    }
    
    private OrderItemDTO convertToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setServiceId(item.getServiceId());
        dto.setServiceName(item.getName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice().doubleValue());
        return dto;
    }
} 