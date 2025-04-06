package com.laundry.model;

import java.util.Date;

/**
 * Model đại diện cho một tin nhắn chat
 */
public class ChatMessage {
    private String id;
    private String content;
    private String sender;      // "customer" hoặc "shop"
    private String senderId;    // ID của người gửi
    private String senderName;  // Tên hiển thị của người gửi
    private String targetId;    // ID của người/cửa hàng nhận
    private Date timestamp;
    private boolean read;
    private String avatar;      // URL avatar của người gửi

    public ChatMessage() {
    }

    public ChatMessage(String content, String sender, String senderId, String senderName, String targetId) {
        this.content = content;
        this.sender = sender;
        this.senderId = senderId;
        this.senderName = senderName;
        this.targetId = targetId;
        this.timestamp = new Date();
        this.read = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
} 
 
 
 
 
 
 
 