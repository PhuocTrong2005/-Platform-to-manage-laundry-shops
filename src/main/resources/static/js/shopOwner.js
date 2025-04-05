// Quản lý cửa hàng
window.shopOwnerManager = {
    // Dữ liệu quản lý cửa hàng
    shopData: {
        shopId: null,
        services: [],
        staff: [],
        orders: []
    },

    // Khởi tạo
    init() {
        console.log('Khởi tạo Shop Owner Manager...');
        
        // Kiểm tra nếu đang ở chế độ phát triển/giả lập
        const isSimulationMode = window.laundryConfig && window.laundryConfig.simulationMode;
        if (isSimulationMode) {
            console.log('Đang chạy ở chế độ giả lập - sẽ sử dụng dữ liệu mẫu.');
        }
        
        // Khởi tạo dữ liệu cho Alpine.js
        this.initAlpineData();
        
        // Thiết lập các event listener
        this.setupEventListeners();
    },

    // Khởi tạo dữ liệu cho Alpine.js
    initAlpineData() {
        if (window.Alpine) {
            console.log('Khởi tạo dữ liệu Alpine.js cho Shop Owner...');
            
            // Bổ sung dữ liệu cho orderManagement nếu cần
            const orderManagement = document.querySelector('[x-data]')?._x_dataStack?.[0];
            if (orderManagement) {
                // Đảm bảo các phương thức cần thiết được khởi tạo
                if (!orderManagement.updateOrderStatus) {
                    orderManagement.updateOrderStatus = this.updateOrderStatus.bind(this);
                }
                
                if (!orderManagement.formatPrice) {
                    orderManagement.formatPrice = this.formatPrice.bind(this);
                }
            }
        }
    },

    // Thiết lập các event listener
    setupEventListeners() {
        // Lắng nghe sự kiện thay đổi trạng thái đơn hàng
        document.addEventListener('order-status-update', (event) => {
            const { orderId, newStatus } = event.detail;
            this.updateOrderStatus(orderId, newStatus);
        });
        
        // Lắng nghe sự kiện sau khi DOM đã tải
        document.addEventListener('DOMContentLoaded', () => {
            // Thêm các event listener cho nút cập nhật trạng thái
            const updateStatusButtons = document.querySelectorAll('.update-status-btn');
            updateStatusButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const orderId = e.target.dataset.orderId;
                    const newStatus = e.target.dataset.status;
                    this.updateOrderStatus(orderId, newStatus);
                });
            });
        });
    },

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, newStatus) {
        try {
            console.log(`Cập nhật trạng thái đơn hàng ${orderId} thành ${newStatus}`);
            
            // Gửi yêu cầu cập nhật lên server
            try {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (!response.ok) {
                    throw new Error(`API trả về lỗi ${response.status}`);
                }
                
                const updatedOrder = await response.json();
                console.log('Cập nhật thành công:', updatedOrder);
                
                // Cập nhật UI
                this.updateOrderUI(orderId, newStatus);
                
                // Hiển thị thông báo thành công
                alert(`Đã cập nhật trạng thái đơn hàng ${orderId} thành ${newStatus}`);
                
            } catch (error) {
                console.warn('Không thể gửi cập nhật trạng thái lên API, cập nhật UI tạm thời:', error);
                
                // Cập nhật UI trong trường hợp API lỗi
                this.updateOrderUI(orderId, newStatus);
                
                // Hiển thị thông báo
                alert(`Đã cập nhật trạng thái đơn hàng ${orderId} thành ${newStatus} (chế độ ngoại tuyến)`);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
        }
    },

    // Cập nhật UI đơn hàng
    updateOrderUI(orderId, newStatus) {
        // Cập nhật UI thông qua Alpine.js nếu có
        if (window.Alpine) {
            const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
            if (alpineData && Array.isArray(alpineData.orders)) {
                // Tìm đơn hàng trong danh sách Alpine
                const orderIndex = alpineData.orders.findIndex(order => order.id === orderId);
                if (orderIndex !== -1) {
                    // Cập nhật trạng thái
                    alpineData.orders[orderIndex].status = newStatus;
                    
                    // Thêm vào lịch sử theo dõi
                    if (alpineData.orders[orderIndex].tracking) {
                        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        alpineData.orders[orderIndex].tracking.current = newStatus;
                        alpineData.orders[orderIndex].tracking.history.push({
                            status: newStatus,
                            time: currentTime
                        });
                    }
                    
                    // Cập nhật số lượng đơn hàng mới nếu cần
                    if (typeof alpineData.countNewOrders === 'function') {
                        alpineData.countNewOrders();
                    }
                }
            }
        }
        
        // Fallback nếu không có Alpine: cập nhật DOM trực tiếp
        const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
        if (orderElement) {
            // Cập nhật badge trạng thái
            const statusBadge = orderElement.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = newStatus;
                
                // Cập nhật class dựa trên trạng thái
                statusBadge.className = 'status-badge px-2 py-1 text-xs rounded-full';
                
                switch (newStatus.toLowerCase()) {
                    case 'chờ xác nhận':
                        statusBadge.classList.add('bg-yellow-100', 'text-yellow-800');
                        break;
                    case 'đang xử lý':
                        statusBadge.classList.add('bg-blue-100', 'text-blue-800');
                        break;
                    case 'đang giao':
                        statusBadge.classList.add('bg-purple-100', 'text-purple-800');
                        break;
                    case 'hoàn thành':
                        statusBadge.classList.add('bg-green-100', 'text-green-800');
                        break;
                    case 'đã hủy':
                        statusBadge.classList.add('bg-red-100', 'text-red-800');
                        break;
                    default:
                        statusBadge.classList.add('bg-gray-100', 'text-gray-800');
                }
            }
            
            // Cập nhật các nút trạng thái
            const statusButtons = orderElement.querySelectorAll('.update-status-btn');
            statusButtons.forEach(button => {
                if (button.dataset.status === newStatus) {
                    button.disabled = true;
                    button.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    button.disabled = false;
                    button.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
        }
    },

    // Quản lý dịch vụ
    async addService(serviceData) {
        try {
            console.log('Thêm dịch vụ mới:', serviceData);
            
            // Gửi yêu cầu thêm dịch vụ lên server
            try {
                const response = await fetch('/api/services', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(serviceData)
                });
                
                if (!response.ok) {
                    throw new Error(`API trả về lỗi ${response.status}`);
                }
                
                const newService = await response.json();
                console.log('Thêm dịch vụ thành công:', newService);
                
                // Cập nhật UI
                this.updateServicesUI();
                
                // Hiển thị thông báo thành công
                alert(`Đã thêm dịch vụ ${newService.serviceName}`);
                
                return newService;
                
            } catch (error) {
                console.warn('Không thể gửi yêu cầu thêm dịch vụ lên API:', error);
                throw error;
            }
        } catch (error) {
            console.error('Lỗi khi thêm dịch vụ:', error);
            alert('Không thể thêm dịch vụ. Vui lòng thử lại sau.');
            throw error;
        }
    },

    // Cập nhật UI dịch vụ
    updateServicesUI() {
        // Cập nhật UI thông qua Alpine.js nếu có
        if (window.Alpine) {
            const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
            if (alpineData) {
                // Tải lại danh sách dịch vụ nếu có phương thức loadServices
                if (typeof alpineData.loadServices === 'function') {
                    alpineData.loadServices();
                }
            }
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

// Tự động khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Khởi tạo shopOwnerManager');
    window.shopOwnerManager.init();
    // Kiểm tra xem shopOwnerManager đã gán vào window object chưa
    console.log('shopOwnerManager đã khởi tạo:', window.shopOwnerManager ? '✅' : '❌');
}); 