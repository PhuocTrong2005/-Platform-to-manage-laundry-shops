package com.laundry.controller;

import com.laundry.model.Invoice;
import com.laundry.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;

    /**
     * Lấy danh sách hóa đơn của khách hàng
     * @param customerId ID khách hàng
     * @return Danh sách hóa đơn
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Invoice>> getCustomerInvoices(@PathVariable Long customerId) {
        List<Invoice> invoices = invoiceService.getCustomerInvoices(customerId);
        return ResponseEntity.ok(invoices);
    }

    /**
     * Lấy chi tiết hóa đơn
     * @param invoiceId ID hóa đơn
     * @return Chi tiết hóa đơn
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<Invoice> getInvoiceDetails(@PathVariable Long invoiceId) {
        Optional<Invoice> invoice = invoiceService.getInvoiceDetails(invoiceId);
        return invoice.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cập nhật trạng thái hóa đơn
     * @param invoiceId ID hóa đơn
     * @param status Trạng thái mới
     * @return Hóa đơn đã được cập nhật
     */
    @PutMapping("/{invoiceId}/status")
    public ResponseEntity<Invoice> updateInvoiceStatus(
        @PathVariable Long invoiceId, 
        @RequestParam String status
    ) {
        Invoice updatedInvoice = invoiceService.updateInvoiceStatus(invoiceId, status);
        return ResponseEntity.ok(updatedInvoice);
    }

    /**
     * Thống kê doanh thu theo trạng thái
     * @param status Trạng thái hóa đơn
     * @return Tổng doanh thu
     */
    @GetMapping("/revenue")
    public ResponseEntity<Double> getTotalRevenueByStatus(@RequestParam String status) {
        Double totalRevenue = invoiceService.getTotalRevenueByStatus(status);
        return ResponseEntity.ok(totalRevenue);
    }
} 