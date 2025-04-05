package com.laundry.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller xử lý các API cho chức năng chat
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    // Trong triển khai thực tế, các dữ liệu này sẽ được lưu vào cơ sở dữ liệu
    private Map<String, List<Map<String, Object>>> conversations = new HashMap<>();
    private Map<String, Map<String, Object>> users = new HashMap<>();

    /**
     * Lấy danh sách khách hàng (cho chủ cửa hàng)
     */
    @GetMapping("/shop/{shopId}/customers")
    public ResponseEntity<?> getCustomers(@PathVariable String shopId) {
        // Giả lập danh sách khách hàng
        List<Map<String, Object>> customers = new ArrayList<>();
        
        Map<String, Object> customer1 = new HashMap<>();
        customer1.put("id", "customer1");
        customer1.put("name", "Nguyễn Văn A");
        customer1.put("lastActive", new Date(System.currentTimeMillis() - 5 * 60 * 1000));
        
        Map<String, Object> customer2 = new HashMap<>();
        customer2.put("id", "customer2");
        customer2.put("name", "Trần Thị B");
        customer2.put("lastActive", new Date(System.currentTimeMillis() - 30 * 60 * 1000));
        
        Map<String, Object> customer3 = new HashMap<>();
        customer3.put("id", "customer3");
        customer3.put("name", "Lê Văn C");
        customer3.put("lastActive", new Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000));
        
        Map<String, Object> customer4 = new HashMap<>();
        customer4.put("id", "customer4");
        customer4.put("name", "Phạm Thị D");
        customer4.put("lastActive", new Date());
        
        customers.add(customer1);
        customers.add(customer2);
        customers.add(customer3);
        customers.add(customer4);
        
        return ResponseEntity.ok(customers);
    }

    /**
     * Lấy tin nhắn mới (cho chủ cửa hàng)
     */
    @GetMapping("/shop/{shopId}/messages/new")
    public ResponseEntity<?> getNewMessagesForShop(@PathVariable String shopId) {
        // Trong triển khai thực tế, bạn sẽ lấy tin nhắn mới từ cơ sở dữ liệu
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * Lấy tin nhắn mới (cho khách hàng)
     */
    @GetMapping("/customer/{customerId}/messages/new")
    public ResponseEntity<?> getNewMessagesForCustomer(@PathVariable String customerId) {
        // Trong triển khai thực tế, bạn sẽ lấy tin nhắn mới từ cơ sở dữ liệu
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * Lấy lịch sử trò chuyện
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable String conversationId) {
        List<Map<String, Object>> conversation = conversations.getOrDefault(conversationId, new ArrayList<>());
        return ResponseEntity.ok(conversation);
    }

    /**
     * Gửi tin nhắn
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> message) {
        String conversationId = (String) message.getOrDefault("conversationId", "default");
        
        // Thêm timestamp nếu chưa có
        if (!message.containsKey("timestamp")) {
            message.put("timestamp", new Date());
        }
        
        // Thêm id cho tin nhắn nếu chưa có
        if (!message.containsKey("id")) {
            message.put("id", UUID.randomUUID().toString());
        }
        
        // Lấy danh sách tin nhắn của cuộc trò chuyện này, tạo mới nếu chưa có
        List<Map<String, Object>> conversation = conversations.computeIfAbsent(
            conversationId, k -> new ArrayList<>()
        );
        
        // Thêm tin nhắn vào cuộc trò chuyện
        conversation.add(message);
        
        return ResponseEntity.ok(message);
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    @PutMapping("/mark-read/{conversationId}")
    public ResponseEntity<?> markAsRead(@PathVariable String conversationId, @RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        boolean isShopOwner = (boolean) request.getOrDefault("isShopOwner", false);
        
        List<Map<String, Object>> conversation = conversations.getOrDefault(conversationId, new ArrayList<>());
        
        for (Map<String, Object> message : conversation) {
            String sender = (String) message.get("sender");
            boolean shouldMark = isShopOwner ? "customer".equals(sender) : "shop".equals(sender);
            
            if (shouldMark && !((boolean) message.getOrDefault("isRead", false))) {
                message.put("isRead", true);
            }
        }
        
        return ResponseEntity.ok(Collections.singletonMap("status", "success"));
    }
} 