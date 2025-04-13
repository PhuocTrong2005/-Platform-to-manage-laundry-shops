package com.laundry.model.admin.enums;

public enum AdminShopStatus {
    ACTIVE("Hoạt động"),
    INACTIVE("Ngừng hoạt động"),
    PENDING("Chờ duyệt"),
    SUSPENDED("Tạm ngưng");

    private final String displayName;

    AdminShopStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 