package com.laundry.dto;

public class OrderItemDTO {
    private Long serviceId;
    private String serviceName;
    private int quantity;
    private double price;

    // Constructors
    public OrderItemDTO() {}

    public OrderItemDTO(Long serviceId, String serviceName, int quantity, double price) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and Setters
    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
} 