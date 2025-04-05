const dashboardManager = {
    // Dữ liệu dashboard
    dashboardData: {
        stats: {
            totalOrders: 0,
            revenue: 0,
            newCustomers: 0,
            pendingOrders: 0,
            ordersGrowth: 0,
            revenueGrowth: 0,
            customersGrowth: 0
        },
        revenueData: [],
        servicesData: [],
        recentOrders: []
    },

    // Khởi tạo dashboard
    async init() {
        try {
            console.log('Khởi tạo dashboard...');
            // Lấy shopId từ localStorage hoặc từ URL
            const shopId = this.getShopId();
            
            // Tải dữ liệu dashboard
            await this.loadDashboardData(shopId);
            
            // Khởi tạo các biểu đồ
            this.initCharts();
            
            // Thiết lập các event listener
            this.setupEventListeners();
            
            // Cập nhật giao diện
            this.updateDashboard();
            
            console.log('Dashboard đã được khởi tạo thành công');
        } catch (error) {
            console.error('Lỗi khi khởi tạo dashboard:', error);
            // Tải dữ liệu giả lập để hiển thị giao diện
            this.loadDemoData();
            this.updateDashboard();
        }
    },

    // Lấy shopId từ localStorage hoặc URL
    getShopId() {
        // Ưu tiên lấy từ localStorage nếu có
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user && user.shopId) {
                    return user.shopId;
                }
            } catch (error) {
                console.warn('Lỗi khi parse dữ liệu user từ localStorage:', error);
            }
        }
        
        // Nếu không có trong localStorage, thử lấy từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const shopId = urlParams.get('shopId');
        
        return shopId || null;
    },

    // Tải dữ liệu dashboard
    async loadDashboardData(shopId) {
        try {
            console.log('Đang tải dữ liệu dashboard cho shop:', shopId);
            if (!shopId) {
                console.warn('Không có shopId, sử dụng dữ liệu giả lập');
                throw new Error('Không có shopId');
            }
            
            try {
                const response = await fetch(`/api/dashboard/${shopId}`);
                if (!response.ok) {
                    console.warn(`API trả về lỗi ${response.status}, sử dụng dữ liệu giả lập`);
                    throw new Error('Failed to load dashboard data');
                }
                
                const data = await response.json();
                this.dashboardData = data;
                
                console.log('Đã tải dữ liệu dashboard thành công:', data);
            } catch (fetchError) {
                console.error('Lỗi khi gọi API dashboard:', fetchError);
                // Tải dữ liệu giả lập
                this.loadDemoData();
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu dashboard:', error);
            // Tải dữ liệu giả lập
            this.loadDemoData();
        }
    },

    // Tải dữ liệu giả lập
    loadDemoData() {
        console.log('Tải dữ liệu giả lập cho dashboard');
        // Dữ liệu thống kê
        this.dashboardData.stats = {
            totalOrders: 125,
            revenue: 15000000,
            newCustomers: 28,
            pendingOrders: 5,
            ordersGrowth: 12.5,
            revenueGrowth: 8.3,
            customersGrowth: 15.2
        };
        
        // Dữ liệu doanh thu theo tháng
        this.dashboardData.revenueData = [
            {month: 'Tháng 1', revenue: 8500000},
            {month: 'Tháng 2', revenue: 9200000},
            {month: 'Tháng 3', revenue: 11000000},
            {month: 'Tháng 4', revenue: 10500000},
            {month: 'Tháng 5', revenue: 12800000},
            {month: 'Tháng 6', revenue: 15000000}
        ];
        
        // Dữ liệu phân bố dịch vụ
        this.dashboardData.servicesData = [
            {service: 'Giặt & Ủi', percentage: 45},
            {service: 'Giặt khô', percentage: 30},
            {service: 'Giặt nhanh', percentage: 15},
            {service: 'Dịch vụ khác', percentage: 10}
        ];
        
        // Dữ liệu đơn hàng gần đây
        this.dashboardData.recentOrders = [
            {id: 'ORD12345', customer: 'Nguyễn Văn A', service: 'Giặt & Ủi', total: 150000, status: 'Hoàn thành', date: '2024-04-01'},
            {id: 'ORD12346', customer: 'Trần Thị B', service: 'Giặt khô', total: 250000, status: 'Đang xử lý', date: '2024-04-02'},
            {id: 'ORD12347', customer: 'Lê Văn C', service: 'Giặt nhanh', total: 120000, status: 'Chờ xử lý', date: '2024-04-03'},
            {id: 'ORD12348', customer: 'Phạm Thị D', service: 'Giặt & Ủi', total: 180000, status: 'Đang giao', date: '2024-04-03'},
            {id: 'ORD12349', customer: 'Hoàng Văn E', service: 'Giặt khô', total: 220000, status: 'Hoàn thành', date: '2024-04-04'}
        ];
    },

    // Cập nhật giao diện dashboard
    updateDashboard() {
        this.updateStats();
        this.updateRecentOrders();
        this.updateCharts();
    },

    // Cập nhật thống kê
    updateStats() {
        try {
            const stats = this.dashboardData.stats;
            
            // Định dạng tiền tệ
            const formatter = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
            });
            
            // Cập nhật các giá trị
            const totalOrdersEl = document.getElementById('total-orders');
            const totalRevenueEl = document.getElementById('total-revenue');
            const newCustomersEl = document.getElementById('new-customers');
            const pendingOrdersEl = document.getElementById('pending-orders');
            
            if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders;
            if (totalRevenueEl) totalRevenueEl.textContent = formatter.format(stats.revenue);
            if (newCustomersEl) newCustomersEl.textContent = stats.newCustomers;
            if (pendingOrdersEl) pendingOrdersEl.textContent = stats.pendingOrders;
            
            // Cập nhật tăng trưởng
            const ordersGrowthEl = document.getElementById('orders-growth');
            const revenueGrowthEl = document.getElementById('revenue-growth');
            const customersGrowthEl = document.getElementById('customers-growth');
            
            // Tạo chuỗi HTML cho chỉ số tăng trưởng
            if (ordersGrowthEl) this.updateGrowthIndicator(ordersGrowthEl, stats.ordersGrowth);
            if (revenueGrowthEl) this.updateGrowthIndicator(revenueGrowthEl, stats.revenueGrowth);
            if (customersGrowthEl) this.updateGrowthIndicator(customersGrowthEl, stats.customersGrowth);
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê:', error);
        }
    },

    // Cập nhật chỉ số tăng trưởng
    updateGrowthIndicator(element, value) {
        if (!element) return;
        
        if (value > 0) {
            element.innerHTML = `<span class="text-green-600">+${value}%</span>`;
            element.classList.add('text-green-600');
            element.classList.remove('text-red-600');
        } else if (value < 0) {
            element.innerHTML = `<span class="text-red-600">${value}%</span>`;
            element.classList.add('text-red-600');
            element.classList.remove('text-green-600');
        } else {
            element.innerHTML = `<span class="text-gray-600">0%</span>`;
            element.classList.remove('text-green-600', 'text-red-600');
            element.classList.add('text-gray-600');
        }
    },

    // Cập nhật danh sách đơn hàng gần đây
    updateRecentOrders() {
        try {
            const recentOrdersTable = document.querySelector('.recent-orders tbody');
            if (!recentOrdersTable) return;
            
            // Định dạng tiền tệ
            const formatter = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
            });
            
            // Tạo HTML cho từng đơn hàng
            const html = this.dashboardData.recentOrders.map(order => {
                // Xác định màu sắc cho trạng thái
                let statusClass = '';
                switch (order.status) {
                    case 'Hoàn thành':
                        statusClass = 'bg-green-100 text-green-800';
                        break;
                    case 'Đang xử lý':
                        statusClass = 'bg-blue-100 text-blue-800';
                        break;
                    case 'Chờ xử lý':
                        statusClass = 'bg-yellow-100 text-yellow-800';
                        break;
                    case 'Đang giao':
                        statusClass = 'bg-purple-100 text-purple-800';
                        break;
                    default:
                        statusClass = 'bg-gray-100 text-gray-800';
                }
                
                return `
                    <tr>
                        <td class="px-6 py-4">${order.id}</td>
                        <td class="px-6 py-4">${order.customer}</td>
                        <td class="px-6 py-4">${order.service}</td>
                        <td class="px-6 py-4">${formatter.format(order.total)}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                ${order.status}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <button class="text-blue-600 hover:text-blue-900" data-order-id="${order.id}">Chi tiết</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            recentOrdersTable.innerHTML = html;
            
            // Thêm event listener cho các nút chi tiết
            const detailButtons = recentOrdersTable.querySelectorAll('[data-order-id]');
            detailButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const orderId = button.dataset.orderId;
                    this.showOrderDetails(orderId);
                });
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật danh sách đơn hàng gần đây:', error);
        }
    },

    // Khởi tạo các biểu đồ
    initCharts() {
        try {
            // Kiểm tra xem Chart đã được định nghĩa chưa
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js không được tải, bỏ qua khởi tạo biểu đồ');
                return;
            }
            
            this.initRevenueChart();
            this.initServicesChart();
        } catch (error) {
            console.error('Lỗi khi khởi tạo biểu đồ:', error);
        }
    },

    // Cập nhật các biểu đồ
    updateCharts() {
        try {
            if (typeof Chart === 'undefined') return;
            
            this.updateRevenueChart();
            this.updateServicesChart();
        } catch (error) {
            console.error('Lỗi khi cập nhật biểu đồ:', error);
        }
    },

    // Khởi tạo biểu đồ doanh thu
    initRevenueChart() {
        try {
            const ctx = document.getElementById('revenueChart');
            if (!ctx) return;
            
            this.revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Doanh thu',
                        data: [],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                            maximumFractionDigits: 0
                                        }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        maximumFractionDigits: 0
                                    }).format(value);
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi khi khởi tạo biểu đồ doanh thu:', error);
        }
    },

    // Cập nhật biểu đồ doanh thu
    updateRevenueChart() {
        try {
            if (!this.revenueChart) return;
            
            const revenueData = this.dashboardData.revenueData;
            
            this.revenueChart.data.labels = revenueData.map(item => item.month);
            this.revenueChart.data.datasets[0].data = revenueData.map(item => item.revenue);
            
            this.revenueChart.update();
        } catch (error) {
            console.error('Lỗi khi cập nhật biểu đồ doanh thu:', error);
        }
    },

    // Khởi tạo biểu đồ dịch vụ
    initServicesChart() {
        try {
            const ctx = document.getElementById('servicesChart');
            if (!ctx) return;
            
            this.servicesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#3B82F6', // blue
                            '#10B981', // green
                            '#F59E0B', // yellow
                            '#6366F1'  // indigo
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value}%`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi khi khởi tạo biểu đồ dịch vụ:', error);
        }
    },

    // Cập nhật biểu đồ dịch vụ
    updateServicesChart() {
        try {
            if (!this.servicesChart) return;
            
            const servicesData = this.dashboardData.servicesData;
            
            this.servicesChart.data.labels = servicesData.map(item => item.service);
            this.servicesChart.data.datasets[0].data = servicesData.map(item => item.percentage);
            
            this.servicesChart.update();
        } catch (error) {
            console.error('Lỗi khi cập nhật biểu đồ dịch vụ:', error);
        }
    },

    // Thiết lập các event listener
    setupEventListeners() {
        try {
            // Lắng nghe sự kiện từ bộ lọc ngày
            const dateFilter = document.getElementById('date-filter');
            if (dateFilter) {
                dateFilter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
            
            // Lắng nghe sự kiện từ bộ lọc trạng thái
            const statusFilter = document.getElementById('status-filter');
            if (statusFilter) {
                statusFilter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
            
            // Lắng nghe sự kiện từ các nút xuất báo cáo
            const reportButtons = document.querySelectorAll('[data-report-type]');
            reportButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const reportType = button.dataset.reportType;
                    this.generateReport(reportType);
                });
            });
        } catch (error) {
            console.error('Lỗi khi thiết lập event listeners:', error);
        }
    },

    // Áp dụng bộ lọc
    applyFilters() {
        try {
            const dateFilter = document.getElementById('date-filter');
            const statusFilter = document.getElementById('status-filter');
            
            const date = dateFilter ? dateFilter.value : '';
            const status = statusFilter ? statusFilter.value : 'all';
            
            console.log('Applying filters:', { date, status });
            
            // Trong triển khai thực tế, bạn sẽ gọi API để lấy dữ liệu đã lọc
            // Ví dụ:
            // this.loadDashboardData(this.getShopId(), { date, status });
            
            // Tạm thời giả lập việc lọc
            this.simulateFiltering(date, status);
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
        }
    },

    // Giả lập việc lọc
    simulateFiltering(date, status) {
        console.log('Simulating filtering with date:', date, 'status:', status);
        // Giả lập việc lọc các đơn hàng gần đây
        if (status !== 'all') {
            const filteredOrders = this.dashboardData.recentOrders.filter(order => 
                order.status.toLowerCase().includes(status.toLowerCase())
            );
            
            // Cập nhật lại danh sách đơn hàng để hiển thị
            const tempOrders = [...this.dashboardData.recentOrders];
            this.dashboardData.recentOrders = filteredOrders;
            this.updateRecentOrders();
            this.dashboardData.recentOrders = tempOrders;
        } else {
            // Hiển thị lại tất cả đơn hàng
            this.updateRecentOrders();
        }
    },

    // Tạo báo cáo
    async generateReport(reportType) {
        try {
            console.log('Generating report:', reportType);
            const shopId = this.getShopId();
            
            if (!shopId) {
                this.showError('Không thể xác định cửa hàng. Vui lòng đăng nhập lại.');
                return;
            }
            
            try {
                // Trong triển khai thực tế, bạn sẽ tải báo cáo từ API
                const response = await fetch(`/api/reports/${shopId}?type=${reportType}`);
                if (!response.ok) {
                    console.warn(`API trả về lỗi ${response.status}, giả lập báo cáo`);
                    throw new Error('Không thể tải báo cáo');
                }
                
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                // Tạo link tải xuống
                const a = document.createElement('a');
                a.href = url;
                a.download = `Báo cáo ${reportType === 'daily' ? 'ngày' : 'tháng'}.xlsx`;
                document.body.appendChild(a);
                a.click();
                
                // Giải phóng URL sau khi tải xuống
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);
            } catch (error) {
                console.error('Lỗi khi tải báo cáo:', error);
                // Giả lập tạo báo cáo
                this.simulateReportGeneration(reportType);
            }
        } catch (error) {
            console.error('Lỗi khi tạo báo cáo:', error);
            this.showError('Không thể tạo báo cáo. Vui lòng thử lại sau.');
        }
    },

    // Giả lập tạo báo cáo
    simulateReportGeneration(reportType) {
        console.log('Simulating report generation:', reportType);
        alert(`Báo cáo ${reportType === 'daily' ? 'ngày' : 'tháng'} đã được tạo và tải xuống.`);
    },

    // Hiển thị thông báo lỗi
    showError(message) {
        console.error(message);
        alert(message);
    },

    // Hiển thị chi tiết đơn hàng
    showOrderDetails(orderId) {
        try {
            console.log('Showing order details for:', orderId);
            // Tìm đơn hàng trong danh sách đơn hàng gần đây
            const order = this.dashboardData.recentOrders.find(o => o.id === orderId);
            
            if (!order) {
                this.showError('Không tìm thấy thông tin đơn hàng.');
                return;
            }
            
            // Trong triển khai thực tế, bạn sẽ tải chi tiết đơn hàng từ API
            // Tạm thời hiển thị thông tin có sẵn
            const modal = document.getElementById('orderDetailsModal');
            if (!modal) {
                console.warn('Không tìm thấy modal chi tiết đơn hàng');
                return;
            }
            
            const orderDetails = modal.querySelector('.order-details');
            if (!orderDetails) {
                console.warn('Không tìm thấy phần tử .order-details trong modal');
                return;
            }
            
            // Định dạng tiền tệ
            const formatter = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
            });
            
            // Tạo HTML cho chi tiết đơn hàng
            orderDetails.innerHTML = `
                <h3 class="text-lg font-medium text-gray-900 mb-4">Chi tiết đơn hàng #${order.id}</h3>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-500">Khách hàng</p>
                            <p>${order.customer}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Ngày đặt</p>
                            <p>${order.date}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-500">Dịch vụ</p>
                            <p>${order.service}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Trạng thái</p>
                            <p>${order.status}</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Tổng tiền</p>
                        <p class="text-lg font-semibold">${formatter.format(order.total)}</p>
                    </div>
                </div>
            `;
            
            // Hiển thị modal
            try {
                if (window.Alpine) {
                    const alpineData = modal._x_dataStack?.[0];
                    if (alpineData && typeof alpineData === 'object') {
                        alpineData.open = true;
                        alpineData.order = order;
                    } else {
                        modal.style.display = 'block';
                    }
                } else {
                    modal.style.display = 'block';
                }
            } catch (alpineError) {
                console.warn('Lỗi khi sử dụng Alpine.js:', alpineError);
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Lỗi khi hiển thị chi tiết đơn hàng:', error);
            this.showError('Không thể hiển thị chi tiết đơn hàng. Vui lòng thử lại sau.');
        }
    }
};

// Tự động khởi tạo dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard');
    dashboardManager.init();
}); 