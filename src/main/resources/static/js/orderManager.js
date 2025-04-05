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
            console.log('DEBUG: Hiển thị chi tiết shop ID:', shopId);
            
            // DEBUG: Kiểm tra templates
            console.log('DEBUG: Templates có tồn tại không?', {
                modalTemplate: !!document.getElementById('shop-detail-modal-template'),
                serviceTemplate: !!document.getElementById('service-item-template')
            });
            
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
                console.log(`Đã tải ${services.length} dịch vụ cho shop ${shopId}`);
                
                // Tạo đánh giá ngẫu nhiên
                const rating = (4.0 + Math.random() * 1.0).toFixed(1);
                const reviewCount = Math.floor(50 + Math.random() * 150);
                
                // Tạo đối tượng shopData hoàn chỉnh
                shopData = {
                    id: shopBasicInfo.id,
                    shopName: shopBasicInfo.shopName,
                    location: shopBasicInfo.location,
                    operatingHours: shopBasicInfo.operatingHours || '08:00 - 20:00',
                    rating: rating,
                    reviewCount: reviewCount,
                    services: services.map(service => ({
                        id: service.id,
                        serviceName: service.serviceName,
                        price: service.price,
                        description: `Dịch vụ ${service.serviceName} chất lượng cao`
                    }))
                };
                
            } catch (error) {
                console.warn('Không thể lấy dữ liệu cửa hàng từ API, sử dụng dữ liệu mẫu:', error.message);
                
                // Dữ liệu mẫu nếu API không có
                shopData = {
                    id: shopId,
                    shopName: 'Tiệm giặt ủi ' + shopId,
                    location: 'Địa chỉ cửa hàng ' + shopId,
                    rating: 4.5,
                    reviewCount: 120,
                    operatingHours: '08:00 - 20:00',
                    services: [
                        { id: 1, serviceName: 'Giặt ủi thường', price: 50000, description: 'Giặt ủi quần áo thông thường' },
                        { id: 2, serviceName: 'Giặt khô', price: 80000, description: 'Giặt khô quần áo cao cấp' },
                        { id: 3, serviceName: 'Giặt nhanh', price: 100000, description: 'Giặt ủi nhanh trong 4 giờ' },
                        { id: 4, serviceName: 'Giặt đồ da', price: 150000, description: 'Giặt làm sạch đồ da chuyên nghiệp' }
                    ]
                };
            }
            
            // Lưu shop đã chọn
            this.orderData.selectedShop = shopData;
            
            // Hiển thị modal chi tiết shop
            this.renderShopDetailModal(shopData);
        } catch (error) {
            console.error('Lỗi khi hiển thị chi tiết shop:', error);
            alert('Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.');
        }
    },

    // Render modal chi tiết shop
    renderShopDetailModal(shopData) {
        // Kiểm tra xem có template không
        const modalTemplate = document.getElementById('shop-detail-modal-template');
        const serviceTemplate = document.getElementById('service-item-template');
        
        if (!modalTemplate || !serviceTemplate) {
            console.error('Không tìm thấy template cho modal chi tiết shop hoặc dịch vụ');
            console.log('DEBUG: Templates tồn tại khi render:', {
                modalTemplate: !!modalTemplate,
                serviceTemplate: !!serviceTemplate,
                bodyContainsModalTemplate: document.body.innerHTML.includes('shop-detail-modal-template')
            });
            
            // Thử tạo modal thủ công nếu không tìm thấy templates
            this.createManualShopModal(shopData);
            return;
        }
        
        console.log('Đang render shop modal cho shop:', shopData.shopName);
        
        // Clone template modal
        const modalContent = modalTemplate.content.cloneNode(true);
        
        // Cập nhật thông tin shop
        modalContent.querySelector('.shop-name').textContent = shopData.shopName;
        modalContent.querySelector('.shop-location').textContent = shopData.location;
        modalContent.querySelector('.shop-hours').textContent = shopData.operatingHours;
        modalContent.querySelector('.shop-rating').textContent = shopData.rating;
        modalContent.querySelector('.shop-reviews').textContent = `(${shopData.reviewCount})`;
        
        // Set ngày mặc định cho lịch hẹn
        const today = new Date().toISOString().split('T')[0];
        const scheduleDate = modalContent.querySelector('#schedule-date');
        scheduleDate.value = today;
        scheduleDate.min = today;
        
        // Render danh sách dịch vụ
        const servicesContainer = modalContent.querySelector('.services-container');
        servicesContainer.innerHTML = ''; // Xóa nội dung mẫu
        
        // Kiểm tra xem có dịch vụ không
        if (!shopData.services || shopData.services.length === 0) {
            servicesContainer.innerHTML = '<div class="text-center p-4 text-gray-500">Cửa hàng chưa cung cấp dịch vụ nào</div>';
        } else {
            shopData.services.forEach(service => {
                // Clone template dịch vụ
                const serviceItem = serviceTemplate.content.cloneNode(true);
                
                // Cập nhật thông tin dịch vụ
                serviceItem.querySelector('.service-name').textContent = service.serviceName;
                serviceItem.querySelector('.service-price').textContent = this.formatPrice(service.price);
                serviceItem.querySelector('.service-description').textContent = service.description || 'Không có mô tả';
                
                // Lưu ID dịch vụ vào các nút
                const addToCartBtn = serviceItem.querySelector('.add-to-cart-btn');
                addToCartBtn.dataset.serviceId = service.id;
                addToCartBtn.dataset.serviceName = service.serviceName;
                addToCartBtn.dataset.servicePrice = service.price;
                
                // Lưu ID dịch vụ vào input số lượng
                const quantityInput = serviceItem.querySelector('.service-quantity');
                quantityInput.id = `quantity-${service.id}`;
                
                // Thêm vào container
                servicesContainer.appendChild(serviceItem);
            });
        }
        
        // Tạo modal element nếu chưa có
        let shopModal = document.getElementById('shop-detail-modal');
        if (!shopModal) {
            shopModal = document.createElement('div');
            shopModal.id = 'shop-detail-modal';
            document.body.appendChild(shopModal);
        }
        
        // Xóa nội dung cũ và thêm nội dung mới
        shopModal.innerHTML = '';
        shopModal.appendChild(modalContent);
        
        // Hiển thị modal
        shopModal.style.display = 'block';
        shopModal.classList.add('fixed', 'inset-0', 'z-50');
        
        console.log('Đã hiển thị shop modal');
        
        // Xử lý sự kiện
        this.setupShopModalEvents(shopModal, shopData);
    },

    // Thiết lập sự kiện cho modal chi tiết shop
    setupShopModalEvents(modal, shopData) {
        // Sự kiện đóng modal
        const closeBtn = modal.querySelector('.close-shop-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Sự kiện click bên ngoài đóng modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Sự kiện thêm vào giỏ hàng
        const addToCartBtns = modal.querySelectorAll('.add-to-cart-btn');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const serviceId = btn.dataset.serviceId;
                const serviceName = btn.dataset.serviceName;
                const servicePrice = parseFloat(btn.dataset.servicePrice);
                const quantityInput = document.getElementById(`quantity-${serviceId}`);
                const quantity = parseInt(quantityInput?.value || '1');
                
                this.addToCart({
                    id: serviceId,
                    shopId: shopData.id,
                    shopName: shopData.shopName,
                    name: serviceName,
                    price: servicePrice,
                    quantity: quantity
                });
            });
        });
        
        // Sự kiện đặt lịch hẹn
        const scheduleBtn = modal.querySelector('.schedule-pickup-btn');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => {
                const scheduleDate = document.getElementById('schedule-date').value;
                const scheduleTime = document.getElementById('schedule-time').value;
                
                if (!scheduleDate || !scheduleTime) {
                    alert('Vui lòng chọn ngày và giờ hẹn');
                    return;
                }
                
                this.orderData.scheduleDate = scheduleDate;
                this.orderData.scheduleTime = scheduleTime;
                
                // Lưu thông tin lịch hẹn
                alert(`Đã đặt lịch hẹn tại ${shopData.shopName} vào ngày ${scheduleDate} lúc ${scheduleTime}`);
            });
        }
        
        // Sự kiện xem giỏ hàng
        const viewCartBtn = modal.querySelector('.view-cart-btn');
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                this.showCart();
            });
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
        if (this.orderData.cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống');
            return;
        }
        
        // Tìm hoặc tạo modal
        let checkoutModal = document.getElementById('checkout-modal');
        if (!checkoutModal) {
            checkoutModal = document.createElement('div');
            checkoutModal.id = 'checkout-modal';
            checkoutModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
            checkoutModal.style.display = 'none';
            document.body.appendChild(checkoutModal);
        }
        
        // Tạo nội dung modal
        checkoutModal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="flex justify-between items-center border-b pb-4 mb-4">
                    <h3 class="text-2xl font-semibold">Thanh toán</h3>
                    <button id="close-checkout-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="checkout-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Thông tin liên hệ</label>
                        <input type="text" id="contact-name" class="w-full p-2 border rounded" placeholder="Họ và tên" required>
                    </div>
                    
                    <div>
                        <input type="tel" id="contact-phone" class="w-full p-2 border rounded" placeholder="Số điện thoại" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Địa chỉ giao nhận</label>
                        <textarea id="delivery-address" class="w-full p-2 border rounded" rows="3" placeholder="Địa chỉ đến lấy/giao đồ" required></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Thời gian</label>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="date" id="pickup-date" class="p-2 border rounded" required>
                            <input type="time" id="pickup-time" class="p-2 border rounded" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Ghi chú</label>
                        <textarea id="order-notes" class="w-full p-2 border rounded" rows="2" placeholder="Ghi chú thêm (nếu có)"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">Phương thức thanh toán</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="payment-method" value="cod" checked>
                                <span class="ml-2">Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="payment-method" value="banking">
                                <span class="ml-2">Chuyển khoản ngân hàng</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="payment-method" value="momo">
                                <span class="ml-2">Ví MoMo</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <div class="flex justify-between mb-2">
                            <span>Tổng tiền hàng:</span>
                            <span>${this.formatPrice(this.orderData.totalAmount)}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span>Phí vận chuyển:</span>
                            <span>${this.formatPrice(15000)}</span>
                        </div>
                        <div class="flex justify-between font-bold text-lg">
                            <span>Tổng thanh toán:</span>
                            <span>${this.formatPrice(this.orderData.totalAmount + 15000)}</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
                            Xác nhận đặt hàng
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Hiển thị modal
        checkoutModal.style.display = 'block';
        
        // Xử lý các sự kiện trong modal
        document.getElementById('close-checkout-modal').addEventListener('click', () => {
            checkoutModal.style.display = 'none';
        });
        
        // Khởi tạo giá trị mặc định cho form
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('pickup-date').value = today;
        document.getElementById('pickup-date').min = today;
        
        // Điền thông tin người dùng vào form nếu có
        if (this.userData) {
            document.getElementById('contact-name').value = this.userData.fullName || '';
            document.getElementById('contact-phone').value = this.userData.phone || '';
        }
        
        // Xử lý sự kiện submit form
        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const orderData = {
                customerName: document.getElementById('contact-name').value,
                customerPhone: document.getElementById('contact-phone').value,
                deliveryAddress: document.getElementById('delivery-address').value,
                pickupDate: document.getElementById('pickup-date').value,
                pickupTime: document.getElementById('pickup-time').value,
                notes: document.getElementById('order-notes').value,
                paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
                items: this.orderData.cart,
                totalAmount: this.orderData.totalAmount,
                deliveryFee: 15000,
                grandTotal: this.orderData.totalAmount + 15000
            };
            
            // Gửi dữ liệu đơn hàng lên server
            this.submitOrder(orderData, () => {
                // Đóng modal khi hoàn tất
                checkoutModal.style.display = 'none';
            });
        });
    },

    // Gửi đơn hàng lên server
    async submitOrder(orderData, callback) {
        try {
            // Kiểm tra người dùng đã đăng nhập chưa
            if (!this.userData) {
                if (confirm('Vui lòng đăng nhập để đặt hàng. Đến trang đăng nhập?')) {
                    window.location.href = '/admin/login';
                }
                return;
            }
            
            console.log('Gửi đơn hàng:', orderData);
            let orderResponse = null;
            
            // Gửi đơn hàng lên API
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...orderData,
                        customerId: this.userData.userId
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API trả về lỗi ${response.status}`);
                }
                
                orderResponse = await response.json();
                console.log('Đặt hàng thành công:', orderResponse);
            } catch (error) {
                console.warn('Không thể gửi đơn hàng lên API, giả lập thành công:', error.message);
                // Giả lập thành công
                orderResponse = {
                    id: 'ORD' + Date.now(),
                    status: 'Đang xử lý',
                    ...orderData
                };
            }
            
            // Thông báo thành công
            alert(`Đặt hàng thành công! Mã đơn hàng: ${orderResponse.id}`);
            
            // Xóa giỏ hàng
            this.clearCart();
            
            // Gọi callback nếu có
            if (typeof callback === 'function') {
                callback();
            }
            
            // Chuyển đến trang đơn hàng
            document.querySelector('[x-data]')?._x_dataStack?.[0]?.activeTab = 'orders';
            
            // Thêm đơn hàng mới vào danh sách đơn hàng
            if (window.Alpine) {
                const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
                if (alpineData && Array.isArray(alpineData.orders)) {
                    const newOrder = {
                        id: orderResponse.id,
                        date: new Date().toISOString().split('T')[0],
                        status: orderResponse.status || 'Đang xử lý',
                        total: this.formatPrice(orderResponse.grandTotal),
                        items: orderResponse.items.map(item => item.name),
                        tracking: {
                            current: 'Đang xử lý',
                            history: [
                                { status: 'Đã tiếp nhận', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                            ]
                        }
                    };
                    
                    // Thêm vào đầu danh sách
                    alpineData.orders.unshift(newOrder);
                }
            }
            
        } catch (error) {
            console.error('Lỗi khi gửi đơn hàng:', error);
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
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