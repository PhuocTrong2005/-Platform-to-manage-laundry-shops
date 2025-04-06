package com.laundry.controller;

import com.laundry.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Date;

/**
 * Controller xử lý các tin nhắn WebSocket
 */
@Controller
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Xử lý tin nhắn gửi từ client
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Thêm thông tin bổ sung nếu cần
        chatMessage.setTimestamp(new Date());
        
        // Xử lý tùy thuộc vào loại người dùng và người nhận
        if ("shop".equals(chatMessage.getSender())) {
            // Gửi tin nhắn đến khách hàng cụ thể
            messagingTemplate.convertAndSendToUser(
                chatMessage.getTargetId(),
                "/queue/messages",
                chatMessage
            );
        } else if ("customer".equals(chatMessage.getSender())) {
            // Gửi tin nhắn đến cửa hàng
            messagingTemplate.convertAndSendToUser(
                chatMessage.getTargetId(),
                "/queue/messages",
                chatMessage
            );
        }
        
        // Bạn cũng có thể lưu tin nhắn vào cơ sở dữ liệu ở đây
    }
    
    /**
     * Xử lý đánh dấu tin nhắn đã đọc
     */
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ChatMessage readReceipt) {
        // Gửi thông báo đến người gửi rằng tin nhắn đã được đọc
        messagingTemplate.convertAndSendToUser(
            readReceipt.getTargetId(),
            "/queue/read-receipts",
            readReceipt
        );
        
        // Bạn cũng có thể cập nhật trạng thái đã đọc trong cơ sở dữ liệu ở đây
    }
} 
 
 
 
 
 
 
 