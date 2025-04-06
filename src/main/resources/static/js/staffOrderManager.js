// Staff Order Manager
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Alpine.js data
    window.staffOrderManager = {
        // Dữ liệu đơn hàng
        orders: [],
        filteredOrders: [],
        selectedOrder: null,
        
        // Bộ lọc và tìm kiếm
        searchQuery: '',
        filters: {
            status: '',
            date: ''
        },
        
        // Cập nhật trạng thái đơn hàng
        orderStatusModal: false,
        newOrderStatus: '',
        orderStatusNote: '',
        
        // Thống kê
        orderStats: {
            newOrders: 0,
            processingOrders: 0,
            completedOrders: 0
        },
        
        // Thống kê doanh thu
        revenueStats: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0
        },
        
        // Khởi tạo
        init() {
            console.log('Khởi tạo Staff Order Manager');
            this.refreshOrders();
            this.fetchOrderStats();
            this.fetchRevenueStats();
        },
        
        // Tải danh sách đơn hàng
        async refreshOrders() {
            try {
                const response = await fetch('/api/orders');
                if (!response.ok) {
                    throw new Error('Không thể tải danh sách đơn hàng');
                }
                
                this.orders = await response.json();
                this.filteredOrders = [...this.orders];
                this.updateOrderStats();
                
                console.log(`Đã tải ${this.orders.length} đơn hàng`);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng:', error);
                
                // Dữ liệu mẫu nếu API không khả dụng
                this.orders = [
                    { 
                        id: 'ORD' + Date.now(), 
                        customerName: 'Nguyễn Văn A', 
                        date: new Date().toLocaleDateString(), 
                        total: 250000, 
                        status: 'Mới',
                        customerPhone: '0912345678',
                        items: [
                            { name: 'Giặt ủi thường', quantity: 2, price: 50000 }
                        ],
                        totalAmount: 100000,
                        deliveryFee: 15000,
                        grandTotal: 115000
                    }
                ];
                this.filteredOrders = [...this.orders];
            }
        },
        
        // Cập nhật thống kê đơn hàng
        updateOrderStats() {
            this.orderStats.newOrders = this.orders.filter(order => order.status === 'Mới').length;
            this.orderStats.processingOrders = this.orders.filter(order => order.status === 'Đang xử lý').length;
            this.orderStats.completedOrders = this.orders.filter(order => order.status === 'Hoàn thành').length;
        },
        
        // Tải thống kê doanh thu
        async fetchRevenueStats() {
            try {
                const response = await fetch('/api/revenue/stats');
                if (!response.ok) {
                    throw new Error('Không thể tải thống kê doanh thu');
                }
                
                const stats = await response.json();
                this.revenueStats = stats;
            } catch (error) {
                console.warn('Lỗi khi tải thống kê doanh thu:', error);
                
                // Dữ liệu mẫu
                this.revenueStats = {
                    today: 500000,
                    thisWeek: 2500000,
                    thisMonth: 10000000
                };
            }
        },
        
        // Lọc đơn hàng
        filterOrders() {
            this.filteredOrders = this.orders.filter(order => {
                const matchStatus = !this.filters.status || order.status === this.filters.status;
                const matchDate = !this.filters.date || order.date === this.filters.date;
                return matchStatus && matchDate;
            });
        },
        
        // Tìm kiếm đơn hàng
        searchOrders() {
            const query = this.searchQuery.toLowerCase();
            this.filteredOrders = this.orders.filter(order => 
                order.id.toLowerCase().includes(query) || 
                order.customerName.toLowerCase().includes(query)
            );
        },
        
        // Xem chi tiết đơn hàng
        viewOrderDetails(order) {
            this.selectedOrder = order;
        },
        
        // Mở modal cập nhật trạng thái
        updateOrderStatus(order) {
            this.selectedOrder = order;
            this.newOrderStatus = order.status;
            this.orderStatusNote = '';
            this.orderStatusModal = true;
        },
        
        // Xác nhận cập nhật trạng thái
        async confirmOrderStatusUpdate() {
            try {
                const response = await fetch(`/api/orders/${this.selectedOrder.id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: this.newOrderStatus,
                        note: this.orderStatusNote
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Không thể cập nhật trạng thái đơn hàng');
                }
                
                // Cập nhật trạng thái trong danh sách
                const index = this.orders.findIndex(order => order.id === this.selectedOrder.id);
                if (index !== -1) {
                    this.orders[index].status = this.newOrderStatus;
                    this.filteredOrders = [...this.orders];
                }
                
                // Đóng modal
                this.orderStatusModal = false;
                this.updateOrderStats();
                
                // Thông báo thành công
                alert(`Đã cập nhật trạng thái đơn hàng ${this.selectedOrder.id} thành ${this.newOrderStatus}`);
            } catch (error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
                alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
            }
        },
        
        // Định dạng giá tiền
        formatPrice(price) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
            }).format(price);
        }
    };

    // Khởi tạo Alpine.js data
    window.staffOrderManager.init();
}); 