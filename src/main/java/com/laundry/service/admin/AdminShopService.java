package com.laundry.service.admin;

import com.laundry.model.admin.AdminShop;
import com.laundry.model.admin.enums.AdminShopStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminShopService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<AdminShop> getAllShops() {
        String sql = "SELECT s.ShopID, s.ShopName, s.Location, s.ServicesOffered, s.OperatingHours, " +
                    "u.UserID as OwnerID, u.FullName as OwnerName, s.CreatedAt " +
                    "FROM Shops s " +
                    "JOIN Users u ON s.OwnerID = u.UserID " +
                    "ORDER BY s.CreatedAt DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminShop shop = new AdminShop();
            shop.setId(rs.getLong("ShopID"));
            shop.setName(rs.getString("ShopName"));
            shop.setOwnerId(rs.getLong("OwnerID"));
            shop.setOwnerName(rs.getString("OwnerName"));
            shop.setLocation(rs.getString("Location"));
            shop.setServices(rs.getString("ServicesOffered"));
            shop.setOperatingHours(rs.getString("OperatingHours"));
            shop.setStatus(AdminShopStatus.ACTIVE);
            shop.setCreatedAt(rs.getTimestamp("CreatedAt").toLocalDateTime());
            return shop;
        });
    }

    public Optional<AdminShop> getShopById(Long id) {
        String sql = "SELECT s.ShopID, s.ShopName, s.Location, s.ServicesOffered, s.OperatingHours, " +
                    "u.UserID as OwnerID, u.FullName as OwnerName, s.CreatedAt " +
                    "FROM Shops s " +
                    "JOIN Users u ON s.OwnerID = u.UserID " +
                    "WHERE s.ShopID = ?";
        
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                AdminShop shop = new AdminShop();
                shop.setId(rs.getLong("ShopID"));
                shop.setName(rs.getString("ShopName"));
                shop.setOwnerId(rs.getLong("OwnerID"));
                shop.setOwnerName(rs.getString("OwnerName"));
                shop.setLocation(rs.getString("Location"));
                shop.setServices(rs.getString("ServicesOffered"));
                shop.setOperatingHours(rs.getString("OperatingHours"));
                shop.setStatus(AdminShopStatus.ACTIVE);
                shop.setCreatedAt(rs.getTimestamp("CreatedAt").toLocalDateTime());
                return shop;
            }, id));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Transactional
    public AdminShop createShop(AdminShop shop) {
        String sql = "INSERT INTO Shops (OwnerID, ShopName, Location, ServicesOffered, OperatingHours, CreatedAt) " +
                    "VALUES (?, ?, ?, ?, ?, GETDATE())";
        
        jdbcTemplate.update(sql,
            shop.getOwnerId(),
            shop.getName(),
            shop.getLocation(),
            shop.getServices(),
            shop.getOperatingHours()
        );
        
        Long id = jdbcTemplate.queryForObject("SELECT SCOPE_IDENTITY()", Long.class);
        shop.setId(id);
        return shop;
    }

    @Transactional
    public boolean updateShop(Long id, AdminShop shop) {
        String sql = "UPDATE Shops " +
                    "SET ShopName = ?, Location = ?, ServicesOffered = ?, OperatingHours = ? " +
                    "WHERE ShopID = ?";
        
        int rowsAffected = jdbcTemplate.update(sql,
            shop.getName(),
            shop.getLocation(),
            shop.getServices(),
            shop.getOperatingHours(),
            id
        );
        
        return rowsAffected > 0;
    }

    @Transactional
    public boolean deleteShop(Long id) {
        // First check if shop exists
        if (!getShopById(id).isPresent()) {
            return false;
        }
        
        // Delete related records in order: Orders -> Reviews -> Services -> Staff -> Shop
        jdbcTemplate.update("DELETE FROM OrderDetails WHERE OrderID IN (SELECT OrderID FROM Orders WHERE ShopID = ?)", id);
        jdbcTemplate.update("DELETE FROM Orders WHERE ShopID = ?", id);
        jdbcTemplate.update("DELETE FROM Reviews WHERE ShopID = ?", id);
        jdbcTemplate.update("DELETE FROM Services WHERE ShopID = ?", id);
        jdbcTemplate.update("DELETE FROM Staff WHERE ShopID = ?", id);
        
        // Finally delete the shop
        return jdbcTemplate.update("DELETE FROM Shops WHERE ShopID = ?", id) > 0;
    }

    public List<AdminShop> getShopsByOwner(Long ownerId) {
        String sql = "SELECT s.ShopID, s.ShopName, s.Location, s.ServicesOffered, s.OperatingHours, " +
                    "u.UserID as OwnerID, u.FullName as OwnerName, s.CreatedAt " +
                    "FROM Shops s " +
                    "JOIN Users u ON s.OwnerID = u.UserID " +
                    "WHERE s.OwnerID = ? " +
                    "ORDER BY s.CreatedAt DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            AdminShop shop = new AdminShop();
            shop.setId(rs.getLong("ShopID"));
            shop.setName(rs.getString("ShopName"));
            shop.setOwnerId(rs.getLong("OwnerID"));
            shop.setOwnerName(rs.getString("OwnerName"));
            shop.setLocation(rs.getString("Location"));
            shop.setServices(rs.getString("ServicesOffered"));
            shop.setOperatingHours(rs.getString("OperatingHours"));
            shop.setStatus(AdminShopStatus.ACTIVE);
            shop.setCreatedAt(rs.getTimestamp("CreatedAt").toLocalDateTime());
            return shop;
        }, ownerId);
    }
} 