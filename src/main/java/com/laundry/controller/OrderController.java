package com.laundry.controller;

import com.laundry.dto.OrderDTO;
import com.laundry.dto.OrderStatusUpdateDTO;
import com.laundry.model.Invoice;
import com.laundry.service.InvoiceService;
import com.laundry.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    @Autowired
    private OrderService orderService;

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Get all orders
     */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        try {
            logger.info("Getting all orders");
            List<OrderDTO> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting all orders", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        try {
            logger.info("Getting order with id: {}", id);
            OrderDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting order", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get orders by shop ID
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByShopId(@PathVariable Long shopId) {
        try {
            logger.info("Getting orders for shop: {}", shopId);
            List<OrderDTO> orders = orderService.getOrdersByShopId(shopId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders for shop", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get orders by customer ID
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByCustomerId(@PathVariable Integer customerId) {
        try {
            logger.info("Getting orders for customer: {}", customerId);
            List<OrderDTO> orders = orderService.getOrdersByCustomerId(customerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders for customer", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get orders by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable String status) {
        try {
            logger.info("Getting orders with status: {}", status);
            List<OrderDTO> orders = orderService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders by status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update order status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id, 
            @RequestBody OrderStatusUpdateDTO statusUpdate) {
        try {
            logger.info("Updating status for order {}: {}", id, statusUpdate.getStatus());
            OrderDTO updatedOrder = orderService.updateOrderStatus(id, statusUpdate);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            logger.error("Error updating order status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create a new order
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderData) {
        try {
            // Log dữ liệu đơn hàng
            logger.info("Nhận được yêu cầu tạo đơn hàng: {}", orderData);
            
            // Validate dữ liệu đầu vào
            if (orderData.getCustomerId() == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin khách hàng");
            }
            
            if (orderData.getItems() == null || orderData.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Giỏ hàng trống");
            }
            
            // Kiểm tra và chuẩn hóa dữ liệu
            if (orderData.getTotalAmount() == null) {
                orderData.setTotalAmount(BigDecimal.ZERO);
            }
            
            if (orderData.getDeliveryFee() == null) {
                orderData.setDeliveryFee(BigDecimal.ZERO);
            }
            
            if (orderData.getGrandTotal() == null) {
                // Tính tổng tiền nếu chưa có
                if (orderData.getTotalAmount() != null) {
                    if (orderData.getDeliveryFee() != null) {
                        orderData.setGrandTotal(orderData.getTotalAmount().add(orderData.getDeliveryFee()));
                    } else {
                        orderData.setGrandTotal(orderData.getTotalAmount());
                    }
                } else {
                    orderData.setGrandTotal(BigDecimal.ZERO);
                }
            }
            
            // Tạo đơn hàng
            OrderDTO savedOrder = orderService.createOrder(orderData);
            logger.info("Đã tạo đơn hàng thành công với ID: {}", savedOrder.getId());
            
            // Trả về kết quả không cần tạo hóa đơn tạm thời
            OrderSuccessResponse response = new OrderSuccessResponse(
                savedOrder.getId(),
                null,
                savedOrder.getStatus(),
                savedOrder.getGrandTotal()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Lỗi khi xử lý đơn hàng: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Lỗi khi xử lý đơn hàng: " + e.getMessage());
        }
    }

    // Class cho response đơn giản
    private static class OrderSuccessResponse {
        private final Long orderId;
        private final Long invoiceId;
        private final String status;
        private final Object totalAmount;

        public OrderSuccessResponse(Long orderId, Long invoiceId, String status, Object totalAmount) {
            this.orderId = orderId;
            this.invoiceId = invoiceId;
            this.status = status;
            this.totalAmount = totalAmount;
        }

        public Long getOrderId() {
            return orderId;
        }

        public Long getInvoiceId() {
            return invoiceId;
        }

        public String getStatus() {
            return status;
        }

        public Object getTotalAmount() {
            return totalAmount;
        }
    }
} 