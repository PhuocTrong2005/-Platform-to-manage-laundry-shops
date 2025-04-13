package com.laundry.service;

import com.laundry.model.*;
import com.laundry.dto.OrderDTO;
import com.laundry.dto.OrderItemDTO;
import com.laundry.repository.InvoiceRepository;
import com.laundry.repository.ServiceRepository;
import com.laundry.repository.UserRepository;
import com.laundry.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {
    private static final Logger logger = LoggerFactory.getLogger(InvoiceService.class);

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ShopRepository shopRepository;

    /**
     * Tạo hóa đơn mới từ dữ liệu đơn hàng
     * @param orderData Dữ liệu đơn hàng từ frontend
     * @return Hóa đơn đã được lưu
     */
    @Transactional
    public Invoice createInvoiceFromOrder(OrderDTO orderData) {
        try {
            logger.info("Bắt đầu tạo hóa đơn từ đơn hàng: {}", orderData);
            
            // Tìm khách hàng
            logger.debug("Tìm thông tin khách hàng với ID: {}", orderData.getCustomerId());
            User customer = userRepository.findById(orderData.getCustomerId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            logger.debug("Đã tìm thấy khách hàng: {}", customer.getFullName());

            // Tìm cửa hàng
            logger.debug("Tìm thông tin cửa hàng với ID: {}", orderData.getShopId());
            Shop shop = orderData.getShopId() != null 
                ? shopRepository.findById(orderData.getShopId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng"))
                : shopRepository.findFirstByOrderByIdAsc();
            logger.debug("Đã tìm thấy cửa hàng: {}", shop);

            // Tạo hóa đơn
            logger.debug("Tạo hóa đơn mới...");
            Invoice invoice = new Invoice(
                customer, 
                shop, 
                orderData.getTotalAmount(),
                orderData.getDeliveryFee(),
                orderData.getPaymentMethod(),
                LocalDateTime.parse(orderData.getPickupDate() + "T" + orderData.getPickupTime()),
                orderData.getDeliveryAddress()
            );

            // Thêm ghi chú nếu có
            invoice.setNotes(orderData.getNotes());

            // Tạo danh sách chi tiết hóa đơn
            logger.debug("Tạo chi tiết hóa đơn cho {} mặt hàng", orderData.getItems().size());
            List<InvoiceItem> invoiceItems = new ArrayList<>();
            for (OrderItemDTO item : orderData.getItems()) {
                // Tìm dịch vụ
                logger.debug("Tìm thông tin dịch vụ với ID: {}", item.getServiceId());
                com.laundry.model.Service service = serviceRepository.findById(item.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ: " + item.getServiceId()));
                logger.debug("Đã tìm thấy dịch vụ: {}", service.toString());

                InvoiceItem invoiceItem = new InvoiceItem(
                    invoice, 
                    service, 
                    item.getQuantity(), 
                    BigDecimal.valueOf(item.getPrice())
                );
                invoiceItems.add(invoiceItem);
            }

            // Gán chi tiết hóa đơn
            invoice.setInvoiceItems(invoiceItems);

            // Lưu hóa đơn
            logger.debug("Lưu hóa đơn vào database...");
            Invoice savedInvoice = invoiceRepository.save(invoice);
            logger.info("Đã lưu hóa đơn thành công với ID: {}", savedInvoice.getId());
            return savedInvoice;
            
        } catch (Exception e) {
            logger.error("Lỗi khi tạo hóa đơn: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi tạo hóa đơn: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy danh sách hóa đơn của khách hàng
     * @param customerId ID khách hàng
     * @return Danh sách hóa đơn
     */
    public List<Invoice> getCustomerInvoices(Long customerId) {
        User customer = userRepository.findById(customerId.intValue())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        return invoiceRepository.findByCustomer(customer);
    }

    /**
     * Cập nhật trạng thái hóa đơn
     * @param invoiceId ID hóa đơn
     * @param newStatus Trạng thái mới
     * @return Hóa đơn đã được cập nhật
     */
    @Transactional
    public Invoice updateInvoiceStatus(Long invoiceId, String newStatus) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        invoice.setStatus(newStatus);
        return invoiceRepository.save(invoice);
    }

    /**
     * Thống kê doanh thu theo trạng thái
     * @param status Trạng thái hóa đơn
     * @return Tổng doanh thu
     */
    public Double getTotalRevenueByStatus(String status) {
        return invoiceRepository.getTotalRevenueByStatus(status);
    }

    /**
     * Lấy chi tiết hóa đơn
     * @param invoiceId ID hóa đơn
     * @return Chi tiết hóa đơn
     */
    public Optional<Invoice> getInvoiceDetails(Long invoiceId) {
        return invoiceRepository.findById(invoiceId);
    }
} 