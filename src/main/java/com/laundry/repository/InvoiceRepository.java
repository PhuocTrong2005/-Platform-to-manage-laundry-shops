package com.laundry.repository;

import com.laundry.model.Invoice;
import com.laundry.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    // Tìm hóa đơn theo khách hàng
    List<Invoice> findByCustomer(User customer);

    // Tìm hóa đơn theo trạng thái
    List<Invoice> findByStatus(String status);

    // Tìm hóa đơn trong khoảng thời gian
    List<Invoice> findByInvoiceDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Tìm hóa đơn của khách hàng trong khoảng thời gian
    @Query("SELECT i FROM Invoice i WHERE i.customer = :customer AND i.invoiceDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByCustomerAndDateRange(
        @Param("customer") User customer, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    // Đếm số lượng hóa đơn theo trạng thái
    long countByStatus(String status);

    // Tổng doanh thu theo trạng thái
    @Query("SELECT SUM(i.grandTotal) FROM Invoice i WHERE i.status = :status")
    Double getTotalRevenueByStatus(@Param("status") String status);
} 