package com.laundry.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket để hỗ trợ chat trực tiếp
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Cấu hình message broker
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Cấu hình prefix cho endpoints gửi tin nhắn đến server
        registry.setApplicationDestinationPrefixes("/app");
        
        // Cấu hình prefix cho kênh broadcast và private messages
        registry.enableSimpleBroker("/topic", "/queue");
        
        // Cấu hình prefix cho tin nhắn riêng tư
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Đăng ký STOMP endpoints
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký endpoint /ws/chat, cho phép kết nối từ mọi nguồn (cross-origin)
        // và sử dụng SockJS để đảm bảo kết nối trong môi trường không hỗ trợ WebSocket
        registry.addEndpoint("/ws/chat")
                .setAllowedOrigins("*")
                .withSockJS();
    }
} 