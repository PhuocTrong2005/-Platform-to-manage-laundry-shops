// Order Manager
window.orderManager = {
    // Dữ liệu đơn hàng
    orderData: {
        selectedShop: null,       // Cửa hàng được chọn
        selectedServices: [],     // Danh sách dịch vụ được chọn
        cart: [],                 // Giỏ hàng
        scheduleDate: '',         // Ngày đặt lịch
        scheduleTime: '',         // Giờ đặt lịch
        notes: '',                // Ghi chú
        deliveryAddress: '',      // Địa chỉ giao hàng
        totalAmount: 0,           // Tổng tiền
        paymentMethod: 'cod'      // Phương thức thanh toán
    },

    // Khởi tạo order manager
    init() {
        console.log('Khởi tạo Order Manager...');
        
        // Kiểm tra nếu đang ở chế độ phát triển/giả lập
        const isSimulationMode = window.laundryConfig && window.laundryConfig.simulationMode;
        if (isSimulationMode) {
            console.log('Đang chạy ở chế độ giả lập - sẽ sử dụng dữ liệu mẫu.');
        }
        
        // Lấy dữ liệu người dùng từ localStorage
        this.userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        
        // Khởi tạo giỏ hàng từ localStorage (nếu có)
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                this.orderData.cart = JSON.parse(savedCart);
                this.updateCartUI();
            } catch (error) {
                console.error('Lỗi khi đọc giỏ hàng từ localStorage:', error);
            }
        }
        
        // Thiết lập event listeners
        this.setupEventListeners();
    },

    // Thiết lập các event listeners
    setupEventListeners() {
        // Lắng nghe sự kiện hiển thị chi tiết shop
        document.addEventListener('shop-selected', (event) => {
            const shopId = event.detail.shopId;
            this.showShopDetails(shopId);
        });
        
        // Lắng nghe sự kiện khi form đặt hàng submit
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }
        
        // Lắng nghe sự kiện khi form scheduling submit
        const scheduleForm = document.getElementById('schedule-form');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.schedulePickup();
            });
        }
    },

    // Hiển thị chi tiết cửa hàng
    async showShopDetails(shopId) {
        try {
            this.orderData.selectedShop = null;
            
            // Lấy dữ liệu cửa hàng từ API
            let shopData = null;
            try {
                // Tải thông tin cửa hàng từ API
                const shopResponse = await fetch(`/api/shops/${shopId}`);
                if (!shopResponse.ok) {
                    throw new Error(`API trả về lỗi ${shopResponse.status}`);
                }
                
                // Lấy thông tin cơ bản của cửa hàng
                const shopBasicInfo = await shopResponse.json();
                
                // Tải danh sách dịch vụ của cửa hàng từ API
                const servicesResponse = await fetch(`/api/services/shop/${shopId}`);
                if (!servicesResponse.ok) {
                    throw new Error(`API dịch vụ trả về lỗi ${servicesResponse.status}`);
                }
                
                // Lấy danh sách dịch vụ
                const services = await servicesResponse.json();
                
                // Tạo đánh giá ngẫu nhiên
                const rating = (4.0 + Math.random() * 1.0).toFixed(1);
                const reviewCount = Math.floor(50 + Math.random() * 150);
                
                // Kết hợp thông tin
                shopData = {
                    ...shopBasicInfo,
                    services: services,
                    rating: rating,
                    reviewCount: reviewCount
                };
            } catch (error) {
                // Xử lý lỗi khi API không có sẵn
                shopData = {
                    id: shopId,
                    name: 'Tiệm giặt ' + shopId,
                    address: '123 Đường ABC, Quận XYZ',
                    phone: '0123456789',
                    rating: (4.0 + Math.random() * 1.0).toFixed(1),
                    reviewCount: Math.floor(50 + Math.random() * 150),
                    services: [
                        {
                            id: 1,
                            serviceName: 'Giặt ủi thường',
                            price: 15000,
                            description: 'Giặt ủi thông thường'
                        },
                        {
                            id: 2,
                            serviceName: 'Giặt hấp',
                            price: 20000,
                            description: 'Giặt hấp cao cấp'
                        }
                    ]
                };
            }

            // Lưu thông tin shop đã chọn
            this.orderData.selectedShop = shopData;
            
            // Hiển thị modal
            const modalTemplate = document.getElementById('shop-detail-modal-template');
            const serviceTemplate = document.getElementById('service-item-template');
            
            if (modalTemplate && serviceTemplate) {
                // Tạo modal từ template
                const modal = modalTemplate.content.cloneNode(true);
                
                // Cập nhật thông tin shop
                modal.querySelector('.shop-name').textContent = shopData.name;
                modal.querySelector('.shop-address').textContent = shopData.address;
                modal.querySelector('.shop-phone').textContent = shopData.phone;
                modal.querySelector('.shop-rating').textContent = shopData.rating;
                modal.querySelector('.review-count').textContent = `(${shopData.reviewCount} đánh giá)`;
                
                // Tạo danh sách dịch vụ
                const servicesList = modal.querySelector('.services-list');
                shopData.services.forEach(service => {
                    const serviceItem = serviceTemplate.content.cloneNode(true);
                    
                    serviceItem.querySelector('.service-name').textContent = service.serviceName;
                    serviceItem.querySelector('.service-price').textContent = 
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                            .format(service.price);
                    serviceItem.querySelector('.service-description').textContent = service.description;
                    
                    // Thêm sự kiện cho nút thêm vào giỏ
                    const addToCartBtn = serviceItem.querySelector('.add-to-cart-btn');
                    addToCartBtn.dataset.serviceId = service.id;
                    addToCartBtn.dataset.serviceName = service.serviceName;
                    addToCartBtn.dataset.servicePrice = service.price;
                    addToCartBtn.addEventListener('click', () => {
                        this.addToCart(service);
                    });
                    
                    servicesList.appendChild(serviceItem);
                });
                
                // Thêm modal vào DOM
                document.body.appendChild(modal);
                
                // Xử lý đóng modal
                const modalElement = document.querySelector('.shop-detail-modal');
                const closeBtn = modalElement.querySelector('.close-modal');
                closeBtn.onclick = () => {
                    modalElement.remove();
                };
                
                // Đóng modal khi click bên ngoài
                modalElement.onclick = (e) => {
                    if (e.target === modalElement) {
                        modalElement.remove();
                    }
                };
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi hiển thị thông tin cửa hàng');
        }
    },

    // Thêm dịch vụ vào giỏ hàng
    addToCart(service) {
        // Kiểm tra xem dịch vụ đã có trong giỏ hàng chưa
        const existingItem = this.orderData.cart.find(item => 
            item.id === service.id && item.shopId === service.shopId
        );
        
        if (existingItem) {
            // Cập nhật số lượng nếu đã có
            existingItem.quantity += service.quantity;
        } else {
            // Thêm mới nếu chưa có
            this.orderData.cart.push(service);
        }
        
        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(this.orderData.cart));
        
        // Cập nhật giao diện giỏ hàng
        this.updateCartUI();
        
        // Thông báo đã thêm
        alert(`Đã thêm ${service.quantity} ${service.name} vào giỏ hàng`);
    },

    // Cập nhật giao diện giỏ hàng
    updateCartUI() {
        // Cập nhật số lượng hiển thị trên icon giỏ hàng
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            if (this.orderData.cart.length > 0) {
                cartBadge.textContent = this.orderData.cart.reduce((total, item) => total + item.quantity, 0);
                cartBadge.classList.remove('hidden');
            } else {
                cartBadge.classList.add('hidden');
            }
        }
        
        // Cập nhật dữ liệu giỏ hàng cho Alpine.js (nếu có)
        if (window.Alpine) {
            const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
            if (alpineData && alpineData.cart !== undefined) {
                alpineData.cart = [...this.orderData.cart];
            }
        }
        
        // Cập nhật tổng tiền
        this.updateTotalAmount();
    },
    
    // Cập nhật tổng tiền
    updateTotalAmount() {
        this.orderData.totalAmount = this.orderData.cart.reduce(
            (total, item) => total + (item.price * item.quantity), 
            0
        );
    },

    // Hiển thị giỏ hàng
    showCart() {
        console.log('Hiển thị giỏ hàng');
        
        // Hiển thị giỏ hàng thông qua Alpine.js
        const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
        if (alpineData && alpineData.cartOpen !== undefined) {
            console.log('Mở giỏ hàng qua Alpine.js');
            alpineData.cartOpen = true;
        } else {
            console.log('Không tìm thấy Alpine.js data, sử dụng fallback');
            // Fallback nếu không có Alpine.js
            const cartSidebar = document.querySelector('.cart-sidebar');
            if (cartSidebar) {
                cartSidebar.classList.remove('translate-x-full');
                cartSidebar.style.display = 'block';
                console.log('Đã hiển thị cart sidebar qua class');
            } else {
                console.error('Không tìm thấy cart-sidebar element!');
                
                // Nếu không tìm thấy cart sidebar, tạo một giỏ hàng tạm thời
                if (this.orderData.cart.length > 0) {
                    let tempCart = document.createElement('div');
                    tempCart.className = 'fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 p-4';
                    tempCart.style.display = 'block';
                    
                    let cartContent = `
                        <div class="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 class="text-lg font-bold">Giỏ hàng</h3>
                            <button id="temp-close-cart" class="text-gray-500">×</button>
                        </div>
                        <div class="space-y-3">
                            ${this.orderData.cart.map(item => `
                                <div class="border p-2 rounded">
                                    <p class="font-medium">${item.name}</p>
                                    <p class="text-sm text-gray-500">Cửa hàng: ${item.shopName}</p>
                                    <div class="flex justify-between mt-2">
                                        <span>SL: ${item.quantity}</span>
                                        <span>${this.formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="border-t mt-4 pt-3">
                            <div class="flex justify-between font-bold">
                                <span>Tổng:</span>
                                <span>${this.formatPrice(this.orderData.totalAmount)}</span>
                            </div>
                            <button class="w-full mt-3 bg-blue-600 text-white py-2 rounded">Thanh toán</button>
                        </div>
                    `;
                    
                    tempCart.innerHTML = cartContent;
                    document.body.appendChild(tempCart);
                    
                    // Thêm sự kiện đóng
                    document.getElementById('temp-close-cart').addEventListener('click', () => {
                        tempCart.remove();
                    });
                } else {
                    alert('Giỏ hàng của bạn đang trống');
                }
            }
        }
    },

    // Xóa dịch vụ khỏi giỏ hàng
    removeFromCart(serviceId, shopId) {
        this.orderData.cart = this.orderData.cart.filter(item => 
            !(item.id === serviceId && item.shopId === shopId)
        );
        
        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(this.orderData.cart));
        
        // Cập nhật giao diện giỏ hàng
        this.updateCartUI();
    },

    // Cập nhật số lượng dịch vụ trong giỏ hàng
    updateCartItemQuantity(serviceId, shopId, quantity) {
        const item = this.orderData.cart.find(item => 
            item.id === serviceId && item.shopId === shopId
        );
        
        if (item) {
            item.quantity = quantity;
            
            // Lưu giỏ hàng vào localStorage
            localStorage.setItem('cart', JSON.stringify(this.orderData.cart));
            
            // Cập nhật giao diện giỏ hàng
            this.updateCartUI();
        }
    },

    // Xóa giỏ hàng
    clearCart() {
        this.orderData.cart = [];
        localStorage.removeItem('cart');
        this.updateCartUI();
    },

    // Hiển thị form thanh toán
    showCheckoutForm() {
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            // Hiển thị modal
            checkoutModal.style.display = 'block';
            
            // Cập nhật thông tin đơn hàng
            const cartItemsContainer = checkoutModal.querySelector('#cart-items');
            const totalElement = checkoutModal.querySelector('#order-total');
            
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '';
                let total = 0;
                
                this.orderData.cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item flex justify-between items-center py-2';
                    itemElement.innerHTML = `
                        <div>
                            <span class="font-medium">${item.name}</span>
                            <span class="text-gray-600"> x ${item.quantity}</span>
                        </div>
                        <div class="text-right">
                            ${this.formatPrice(item.price * item.quantity)}
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                    total += item.price * item.quantity;
                });
                
                if (totalElement) {
                    totalElement.textContent = this.formatPrice(total);
                }
            }
            
            // Xử lý form thanh toán
            const form = document.getElementById('checkout-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    // Thu thập dữ liệu form
                    const formData = new FormData(form);
                    const orderData = {
                        customerName: formData.get('customerName'),
                        customerPhone: formData.get('customerPhone'),
                        deliveryAddress: formData.get('deliveryAddress'),
                        pickupDate: formData.get('pickupDate'),
                        pickupTime: formData.get('pickupTime'),
                        paymentMethod: formData.get('paymentMethod'),
                        items: this.orderData.cart.map(item => ({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            shopId: item.shopId
                        }))
                    };
                    
                    // Kiểm tra dữ liệu
                    const validationErrors = [];
                    if (!orderData.customerName) validationErrors.push('Vui lòng nhập họ tên');
                    if (!orderData.customerPhone) validationErrors.push('Vui lòng nhập số điện thoại');
                    if (!orderData.deliveryAddress) validationErrors.push('Vui lòng nhập địa chỉ');
                    if (!orderData.pickupDate) validationErrors.push('Vui lòng chọn ngày lấy hàng');
                    if (!orderData.pickupTime) validationErrors.push('Vui lòng chọn giờ lấy hàng');
                    if (!orderData.items || orderData.items.length === 0) validationErrors.push('Giỏ hàng trống');
                    
                    // Nếu có lỗi, hiển thị và dừng lại
                    if (validationErrors.length > 0) {
                        alert('Vui lòng kiểm tra lại thông tin:\n' + validationErrors.join('\n'));
                        return;
                    }
                    
                    // Đảm bảo có shopId
                    if (!orderData.shopId && orderData.items && orderData.items.length > 0 && orderData.items[0].shopId) {
                        orderData.shopId = orderData.items[0].shopId;
                    } else if (!orderData.shopId) {
                        orderData.shopId = 1;
                    }
                    
                    // Gửi dữ liệu đơn hàng lên server
                    this.submitOrder(orderData, () => {
                        // Đóng modal khi hoàn tất
                        checkoutModal.style.display = 'none';
                    });
                });
            }
        }
    },

    // Gửi đơn hàng
    async submitOrder(orderData, callback) {
        try {
            // Kiểm tra dữ liệu
            const validationErrors = [];
            if (!orderData.customerName) validationErrors.push('Vui lòng nhập họ tên');
            if (!orderData.customerPhone) validationErrors.push('Vui lòng nhập số điện thoại');
            if (!orderData.deliveryAddress) validationErrors.push('Vui lòng nhập địa chỉ');
            if (!orderData.pickupDate) validationErrors.push('Vui lòng chọn ngày lấy hàng');
            if (!orderData.pickupTime) validationErrors.push('Vui lòng chọn giờ lấy hàng');
            if (!orderData.items || orderData.items.length === 0) validationErrors.push('Giỏ hàng trống');
            
            // Nếu có lỗi, hiển thị và dừng lại
            if (validationErrors.length > 0) {
                alert('Vui lòng kiểm tra lại thông tin:\n' + validationErrors.join('\n'));
                return;
            }
            
            // Đảm bảo có shopId
            if (!orderData.shopId && orderData.items && orderData.items.length > 0 && orderData.items[0].shopId) {
                orderData.shopId = orderData.items[0].shopId;
            } else if (!orderData.shopId) {
                orderData.shopId = 1;
            }
            
            let orderResponse = null;
            
            try {
                // Gửi đơn hàng lên server
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                if (!response.ok) {
                    throw new Error('Lỗi khi gửi đơn hàng');
                }
                
                orderResponse = await response.json();
                
            } catch (error) {
                // Nếu API lỗi, tạo đơn hàng giả
                if (window.laundryConfig?.simulationMode) {
                    orderResponse = {
                        id: 'ORD' + Math.floor(Math.random() * 10000),
                        status: 'PENDING',
                        items: orderData.items,
                        total: orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                        customerName: orderData.customerName,
                        customerPhone: orderData.customerPhone,
                        deliveryAddress: orderData.deliveryAddress,
                        pickupDate: orderData.pickupDate,
                        pickupTime: orderData.pickupTime
                    };
                } else {
                    throw error;
                }
            }
            
            if (orderResponse) {
                // Xóa giỏ hàng
                this.clearCart();
                
                // Hiển thị thông báo thành công
                alert('Đặt hàng thành công! Mã đơn hàng: ' + orderResponse.id);
                
                // Gọi callback nếu có
                if (typeof callback === 'function') {
                    callback(orderResponse);
                }
                
                // Gửi sự kiện đặt hàng thành công
                const orderPlacedEvent = new CustomEvent('orderPlaced', {
                    detail: orderResponse
                });
                document.dispatchEvent(orderPlacedEvent);
            }
            
        } catch (error) {
            alert('Có lỗi xảy ra khi đặt hàng: ' + error.message);
        }
    },

    // Định dạng giá tiền
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    },

    // Phương thức tạo modal thủ công nếu không tìm thấy templates
    createManualShopModal(shopData) {
        console.log('Tạo modal thủ công cho shop:', shopData.shopName);
        
        // Tạo modal element
        let shopModal = document.getElementById('shop-detail-modal');
        if (!shopModal) {
            shopModal = document.createElement('div');
            shopModal.id = 'shop-detail-modal';
            shopModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
            document.body.appendChild(shopModal);
        }
        
        // Tạo nội dung modal
        const modalHTML = `
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="flex justify-between items-center border-b pb-4 mb-4">
                    <h3 class="text-2xl font-semibold">${shopData.shopName}</h3>
                    <button class="manual-close-shop-modal text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <p class="mb-2"><strong>Địa chỉ:</strong> ${shopData.location}</p>
                    <p class="mb-2"><strong>Giờ mở cửa:</strong> ${shopData.operatingHours}</p>
                    <p class="mb-4"><strong>Đánh giá:</strong> ${shopData.rating} (${shopData.reviewCount} đánh giá)</p>
                    
                    <h4 class="text-lg font-medium mb-3">Dịch vụ có sẵn</h4>
                    <div class="space-y-3">
                        ${shopData.services.map(service => `
                            <div class="border p-3 rounded">
                                <div class="flex justify-between items-center mb-2">
                                    <h5 class="font-medium">${service.serviceName}</h5>
                                    <span class="font-semibold">${this.formatPrice(service.price)}</span>
                                </div>
                                <p class="text-sm text-gray-600 mb-3">${service.description || 'Không có mô tả'}</p>
                                <div class="flex justify-end">
                                    <button class="add-manual-service bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                            data-service-id="${service.id}"
                                            data-service-name="${service.serviceName}"
                                            data-service-price="${service.price}">
                                        <i class="fas fa-cart-plus mr-1"></i>Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="border-t pt-4 flex justify-between">
                    <button class="manual-close-shop-modal bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                        Đóng
                    </button>
                    <button class="manual-view-cart bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                        <i class="fas fa-shopping-cart mr-1"></i>Xem giỏ hàng
                    </button>
                </div>
            </div>
        `;
        
        // Cập nhật nội dung modal
        shopModal.innerHTML = modalHTML;
        
        // Hiển thị modal
        shopModal.style.display = 'block';
        
        // Thiết lập sự kiện
        // Đóng modal
        shopModal.querySelectorAll('.manual-close-shop-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                shopModal.style.display = 'none';
            });
        });
        
        // Thêm vào giỏ hàng
        shopModal.querySelectorAll('.add-manual-service').forEach(btn => {
            btn.addEventListener('click', () => {
                const serviceId = btn.dataset.serviceId;
                const serviceName = btn.dataset.serviceName;
                const servicePrice = parseFloat(btn.dataset.servicePrice);
                
                this.addToCart({
                    id: serviceId,
                    shopId: shopData.id,
                    shopName: shopData.shopName,
                    name: serviceName,
                    price: servicePrice,
                    quantity: 1
                });
            });
        });
        
        // Xem giỏ hàng
        shopModal.querySelector('.manual-view-cart').addEventListener('click', () => {
            shopModal.style.display = 'none';
            this.showCart();
        });
        
        // Đóng khi click nền
        shopModal.addEventListener('click', (e) => {
            if (e.target === shopModal) {
                shopModal.style.display = 'none';
            }
        });
    }
};

// Tự động khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Khởi tạo orderManager');
    window.orderManager.init();
    // Kiểm tra xem orderManager đã gán vào window object chưa
    console.log('orderManager đã khởi tạo:', window.orderManager ? '✅' : '❌');
}); 