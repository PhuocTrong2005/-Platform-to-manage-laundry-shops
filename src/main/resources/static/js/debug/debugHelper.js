// Debug Helper - Thêm chức năng kiểm tra lỗi
const debugHelper = {
    scripts: [
        { name: 'Alpine.js', global: 'Alpine', status: null },
        { name: 'orderManager.js', global: 'orderManager', status: null },
        { name: 'customer.js', global: 'customerManager', status: null },
        { name: 'chatManager.js', global: 'chatManager', status: null },
        { name: 'reviewManager.js', global: 'reviewManager', status: null }
    ],
    
    init() {
        console.log('🔍 Debug Helper đã khởi động');
        this.checkAllScriptsLoaded();
        this.monitorDOMElements();
        this.addTestButtons();
        this.monitorEvents();
    },
    
    checkAllScriptsLoaded() {
        console.log('🔍 Kiểm tra các script đã tải hay chưa');
        
        this.scripts.forEach(script => {
            script.status = window[script.global] !== undefined;
            console.log(`${script.name}: ${script.status ? '✅ Đã tải' : '❌ Chưa tải'}`);
        });
        
        // Kiểm tra thứ tự tải script
        const loadedScripts = document.querySelectorAll('script');
        console.log('Thứ tự tải script:');
        loadedScripts.forEach((script, index) => {
            const src = script.src || '[inline script]';
            const defer = script.defer ? 'defer' : '';
            const async = script.async ? 'async' : '';
            const attributes = [defer, async].filter(Boolean).join(', ');
            console.log(`${index + 1}. ${src.split('/').pop()} ${attributes ? `(${attributes})` : ''}`);
        });
    },

    monitorDOMElements() {
        console.log('🔍 Kiểm tra các template quan trọng');
        const templates = [
            'shop-card-template',
            'shop-detail-modal-template',
            'service-item-template'
        ];

        templates.forEach(id => {
            const element = document.getElementById(id);
            console.log(`Template ${id}: ${element ? '✅ OK' : '❌ Không tìm thấy'}`);
        });

        // Kiểm tra cart và shop container
        console.log('Kiểm tra cart sidebar:', document.querySelector('.cart-sidebar') ? '✅ OK' : '❌ Không tìm thấy');
        console.log('Kiểm tra shops container:', document.getElementById('shops-container') ? '✅ OK' : '❌ Không tìm thấy');
    },

    addTestButtons() {
        // Thêm các nút test vào trang
        const debugPanel = document.createElement('div');
        debugPanel.className = 'fixed left-2 bottom-2 bg-white p-2 rounded shadow-lg z-50 text-sm';
        debugPanel.innerHTML = `
            <div class="font-bold mb-2">Debug Panel</div>
            <div class="space-y-1">
                <button id="check-scripts-btn" class="block w-full bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded">Kiểm tra Scripts</button>
                <button id="test-shop-card" class="block w-full bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded">Test Shop Card</button>
                <button id="test-shop-modal" class="block w-full bg-green-100 hover:bg-green-200 px-3 py-1 rounded">Test Shop Modal</button>
                <button id="test-cart" class="block w-full bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded">Test Cart</button>
                <div class="pt-1">
                    <label class="text-xs block">Alpine Data</label>
                    <button id="test-alpine" class="block w-full bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded">Check Alpine</button>
                </div>
            </div>
        `;
        document.body.appendChild(debugPanel);

        // Thêm sự kiện cho các nút
        document.getElementById('check-scripts-btn').addEventListener('click', () => this.checkAllScriptsLoaded());
        document.getElementById('test-shop-card').addEventListener('click', () => this.testShopCard());
        document.getElementById('test-shop-modal').addEventListener('click', () => this.testShopModal());
        document.getElementById('test-cart').addEventListener('click', () => this.testCart());
        document.getElementById('test-alpine').addEventListener('click', () => this.checkAlpineData());
    },

    monitorEvents() {
        // Giám sát các event quan trọng
        document.addEventListener('shop-selected', (e) => {
            console.log('🔔 Event shop-selected được kích hoạt:', e.detail);
        });
    },

    testShopCard() {
        console.log('🧪 Test tạo shop card');
        
        // Lấy template
        const template = document.getElementById('shop-card-template');
        if (!template) {
            console.error('❌ Không tìm thấy template shop-card-template');
            alert('Không tìm thấy template shop-card-template');
            return;
        }

        // Tạo shop card từ template
        const shopCard = template.content.cloneNode(true);
        shopCard.querySelector('.shop-name').textContent = 'Test Shop';
        shopCard.querySelector('.shop-address').textContent = 'Test Address';
        shopCard.querySelector('.shop-rating').textContent = '5.0';
        shopCard.querySelector('.shop-reviews').textContent = '(999)';
        shopCard.querySelector('.shop-hours').textContent = '24/7';
        
        // Thêm dịch vụ mẫu
        const servicesContainer = shopCard.querySelector('.shop-services');
        const services = ['Test Service 1', 'Test Service 2'];
        services.forEach(service => {
            const tag = document.createElement('span');
            tag.className = 'service-tag bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded';
            tag.textContent = service;
            servicesContainer.appendChild(tag);
        });
        
        // Thêm vào container
        const container = document.getElementById('shops-container');
        if (!container) {
            console.error('❌ Không tìm thấy container shops-container');
            alert('Không tìm thấy container shops-container');
            return;
        }
        
        container.innerHTML = '';
        container.appendChild(shopCard);
        
        console.log('✅ Đã tạo shop card thành công');
        
        // Thêm sự kiện cho nút xem chi tiết
        const viewBtn = container.querySelector('.view-shop-btn');
        viewBtn.addEventListener('click', () => {
            console.log('🔔 Click vào nút xem chi tiết');
            const event = new CustomEvent('shop-selected', {
                detail: { shopId: 999 }
            });
            document.dispatchEvent(event);
        });
    },

    testShopModal() {
        console.log('🧪 Test shop modal');
        
        // Kiểm tra xem orderManager có tồn tại không
        if (typeof window.orderManager === 'undefined') {
            console.error('❌ Không tìm thấy orderManager');
            alert('orderManager không tồn tại trong window object. Vui lòng kiểm tra thứ tự tải script.');
            
            console.log('Tạo orderManager tạm thời để kiểm tra modal...');
            
            // Tạo tạm đối tượng orderManager để test
            window.orderManager = {
                orderData: {
                    selectedShop: null,
                    cart: []
                },
                
                showShopDetails(shopId) {
                    console.log('Giả lập hiển thị chi tiết shop:', shopId);
                    alert('Đang hiển thị shop ' + shopId + ' (phiên bản giả lập)');
                    
                    // Kiểm tra template
                    const modalTemplate = document.getElementById('shop-detail-modal-template');
                    if (!modalTemplate) {
                        console.error('Không tìm thấy template shop-detail-modal-template');
                        return;
                    }
                    
                    // Tạo mock shop
                    const mockShop = {
                        id: shopId,
                        shopName: 'Test Shop ' + shopId,
                        location: 'Địa chỉ test',
                        operatingHours: '08:00 - 20:00',
                        rating: 4.5,
                        reviewCount: 123,
                        services: [
                            {id: 1, serviceName: 'Dịch vụ test 1', price: 50000, description: 'Mô tả dịch vụ test 1'},
                            {id: 2, serviceName: 'Dịch vụ test 2', price: 70000, description: 'Mô tả dịch vụ test 2'}
                        ]
                    };
                    
                    // Render modal
                    this.renderShopDetailModal(mockShop);
                },
                
                renderShopDetailModal(shopData) {
                    // Clone template
                    const modalTemplate = document.getElementById('shop-detail-modal-template');
                    const serviceTemplate = document.getElementById('service-item-template');
                    
                    if (!modalTemplate || !serviceTemplate) {
                        console.error('Không tìm thấy template cho modal hoặc service item');
                        return;
                    }
                    
                    const modalContent = modalTemplate.content.cloneNode(true);
                    
                    // Cập nhật dữ liệu
                    modalContent.querySelector('.shop-name').textContent = shopData.shopName;
                    modalContent.querySelector('.shop-location').textContent = shopData.location;
                    modalContent.querySelector('.shop-hours').textContent = shopData.operatingHours;
                    modalContent.querySelector('.shop-rating').textContent = shopData.rating;
                    modalContent.querySelector('.shop-reviews').textContent = `(${shopData.reviewCount})`;
                    
                    // Render services
                    const servicesContainer = modalContent.querySelector('.services-container');
                    if (servicesContainer) {
                        servicesContainer.innerHTML = '';
                        shopData.services.forEach(service => {
                            const serviceItem = serviceTemplate.content.cloneNode(true);
                            serviceItem.querySelector('.service-name').textContent = service.serviceName;
                            serviceItem.querySelector('.service-price').textContent = this.formatPrice(service.price);
                            serviceItem.querySelector('.service-description').textContent = service.description;
                            servicesContainer.appendChild(serviceItem);
                        });
                    }
                    
                    // Tạo modal
                    let shopModal = document.getElementById('shop-detail-modal');
                    if (!shopModal) {
                        shopModal = document.createElement('div');
                        shopModal.id = 'shop-detail-modal';
                        document.body.appendChild(shopModal);
                    }
                    
                    // Thêm nội dung
                    shopModal.innerHTML = '';
                    shopModal.appendChild(modalContent);
                    
                    // Hiển thị
                    shopModal.style.display = 'block';
                    
                    // Sự kiện đóng modal
                    const closeBtn = shopModal.querySelector('.close-shop-modal');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            shopModal.style.display = 'none';
                        });
                    }
                },
                
                addToCart() {
                    alert('Giả lập thêm vào giỏ hàng');
                },
                
                formatPrice(price) {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0
                    }).format(price);
                }
            };
            
            console.log('✅ Đã tạo giả lập orderManager');
        } else {
            console.log('✅ orderManager đã tồn tại:', window.orderManager);
        }
        
        // Kiểm tra template shop-detail-modal-template
        const modalTemplate = document.getElementById('shop-detail-modal-template');
        if (!modalTemplate) {
            console.error('❌ Không tìm thấy template shop-detail-modal-template');
            alert('Không tìm thấy template shop-detail-modal-template');
            return;
        }
        
        // Kiểm tra template service-item-template
        const serviceTemplate = document.getElementById('service-item-template');
        if (!serviceTemplate) {
            console.error('❌ Không tìm thấy template service-item-template');
            alert('Không tìm thấy template service-item-template');
            return;
        }
        
        // Trực tiếp gọi method showShopDetails của orderManager
        window.orderManager.showShopDetails(999);
        console.log('✅ Đã gọi orderManager.showShopDetails(999)');
    },

    testCart() {
        console.log('🧪 Test giỏ hàng');
        
        // Kiểm tra xem orderManager có tồn tại không
        if (typeof window.orderManager === 'undefined') {
            console.warn('❌ Không tìm thấy orderManager trong window object - Tạo tạm một đối tượng để test');
            
            // Tạo tạm đối tượng orderManager để test giỏ hàng
            window.orderManager = {
                orderData: {
                    selectedShop: null,
                    cart: []
                },
                
                addToCart(item) {
                    console.log('Thêm vào giỏ hàng:', item);
                    this.orderData.cart.push(item);
                    this.updateCartUI();
                    alert(`Đã thêm ${item.name} vào giỏ hàng`);
                },
                
                showCart() {
                    console.log('Hiển thị giỏ hàng với các mục:', this.orderData.cart);
                    
                    // Kiểm tra Alpine.js
                    const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
                    if (alpineData && alpineData.cartOpen !== undefined) {
                        alpineData.cartOpen = true;
                        console.log('Đã mở giỏ hàng qua Alpine');
                    } else {
                        // Fallback nếu không có Alpine
                        const cartSidebar = document.querySelector('.cart-sidebar');
                        if (cartSidebar) {
                            cartSidebar.classList.remove('translate-x-full');
                            console.log('Đã mở giỏ hàng qua class CSS');
                        } else {
                            alert('Giỏ hàng đã được mở (Giả lập): ' + JSON.stringify(this.orderData.cart));
                        }
                    }
                },
                
                updateCartUI() {
                    console.log('Cập nhật UI giỏ hàng');
                    // Cập nhật số lượng hiển thị trên badge
                    const cartBadge = document.querySelector('.cart-badge');
                    if (cartBadge) {
                        const totalItems = this.orderData.cart.reduce((acc, item) => acc + item.quantity, 0);
                        cartBadge.textContent = totalItems;
                        cartBadge.classList.remove('hidden');
                    }
                    
                    // Cập nhật Alpine.js data
                    const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
                    if (alpineData && alpineData.cart !== undefined) {
                        alpineData.cart = [...this.orderData.cart];
                        console.log('Đã cập nhật giỏ hàng Alpine');
                    }
                },
                
                init() {
                    console.log('Khởi tạo orderManager giả lập');
                }
            };
            
            console.log('✅ Đã tạo giả lập orderManager');
        }
        
        // Kiểm tra cart sidebar
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (!cartSidebar) {
            console.error('❌ Không tìm thấy cart sidebar');
            alert('Không tìm thấy cart sidebar');
            return;
        }
        
        // Thêm sản phẩm mẫu vào giỏ hàng
        window.orderManager.addToCart({
            id: 'debug1',
            shopId: 999,
            shopName: 'Debug Shop',
            name: 'Debug Service',
            price: 99000,
            quantity: 1
        });
        
        // Hiển thị giỏ hàng
        window.orderManager.showCart();
        console.log('✅ Đã thêm sản phẩm mẫu và hiển thị giỏ hàng');
    },

    checkAlpineData() {
        console.log('🧪 Kiểm tra Alpine.js data');
        
        // Kiểm tra xem Alpine.js đã load chưa
        if (typeof window.Alpine === 'undefined') {
            console.error('❌ Alpine.js chưa được load');
            alert('Alpine.js chưa được load');
            return;
        }
        
        // Lấy Alpine data
        const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
        if (!alpineData) {
            console.error('❌ Không tìm thấy Alpine data');
            alert('Không tìm thấy Alpine data');
            return;
        }
        
        console.log('✅ Alpine data:', alpineData);
        
        // Kiểm tra biến cartOpen
        if (alpineData.cartOpen !== undefined) {
            console.log('cartOpen hiện tại:', alpineData.cartOpen);
            
            // Toggle cartOpen
            alpineData.cartOpen = !alpineData.cartOpen;
            console.log('đã toggle cartOpen thành:', alpineData.cartOpen);
        } else {
            console.error('❌ Không tìm thấy biến cartOpen trong Alpine data');
            alert('Không tìm thấy biến cartOpen trong Alpine data');
        }
    }
};

// Khởi tạo debug helper khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    debugHelper.init();
});

// Giám sát DOM để kiểm tra các sự kiện
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug: DOM Loaded');
    
    // Kiểm tra orderManager
    if (window.orderManager) {
        console.log('Debug: OrderManager tồn tại');
        if (typeof window.orderManager.showCheckoutForm === 'function') {
            console.log('Debug: Phương thức showCheckoutForm tồn tại');
        } else {
            console.error('Debug: Phương thức showCheckoutForm KHÔNG tồn tại');
        }
    } else {
        console.error('Debug: OrderManager KHÔNG tồn tại trong window');
    }
    
    // Thêm ghi đè tạm thời cho showCheckoutForm nếu có vấn đề
    window.debugShowCheckout = function() {
        console.log('Debug: Đang gọi showCheckoutForm từ debug helper');
        try {
            if (window.orderManager && typeof window.orderManager.showCheckoutForm === 'function') {
                window.orderManager.showCheckoutForm();
            } else {
                createFallbackCheckoutModal();
            }
        } catch (error) {
            console.error('Debug: Lỗi khi gọi showCheckoutForm:', error);
            createFallbackCheckoutModal();
        }
    };
    
    // Tạo modal thanh toán dự phòng
    function createFallbackCheckoutModal() {
        console.log('Debug: Tạo modal thanh toán dự phòng');
        
        // Lấy giỏ hàng từ localStorage
        let cart = [];
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Debug: Lỗi khi đọc giỏ hàng từ localStorage:', error);
        }
        
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống');
            return;
        }
        
        // Tính tổng tiền
        const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Tạo modal
        const modal = document.createElement('div');
        modal.id = 'debug-checkout-modal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="flex justify-between items-center border-b pb-4 mb-4">
                    <h3 class="text-2xl font-semibold">Thanh toán (Debug Mode)</h3>
                    <button id="debug-close-checkout" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="p-4 text-center">
                    <p class="mb-4">Debug checkout form - Chức năng dự phòng</p>
                    <p>Tổng số món hàng: ${cart.length}</p>
                    <p>Tổng tiền: ${formatPrice(totalAmount)}</p>
                    <p>Phí vận chuyển: ${formatPrice(15000)}</p>
                    <p class="font-bold">Tổng thanh toán: ${formatPrice(totalAmount + 15000)}</p>
                </div>
                
                <div class="flex justify-end mt-4">
                    <button id="debug-submit-order" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
                        Xác nhận đặt hàng
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Xử lý sự kiện đóng
        document.getElementById('debug-close-checkout').addEventListener('click', () => {
            modal.remove();
        });
        
        // Xử lý sự kiện xác nhận đặt hàng
        document.getElementById('debug-submit-order').addEventListener('click', () => {
            alert('Đã đặt hàng thành công (Debug Mode)');
            localStorage.removeItem('cart');
            modal.remove();
            
            // Cập nhật UI nếu cần
            try {
                if (window.Alpine) {
                    const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
                    if (alpineData && alpineData.cart !== undefined) {
                        alpineData.cart = [];
                    }
                }
            } catch (error) {
                console.error('Debug: Lỗi khi cập nhật UI:', error);
            }
        });
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    }
    
    // Kiểm tra nút thanh toán
    setTimeout(function() {
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            console.log('Debug: Nút thanh toán tồn tại');
            
            // Thêm một sự kiện lắng nghe dự phòng
            checkoutButton.addEventListener('click', function() {
                console.log('Debug: Nút thanh toán đã được nhấp');
                window.debugShowCheckout();
            });
        } else {
            console.error('Debug: Nút thanh toán KHÔNG tồn tại');
        }
    }, 1000);
}); 
 
 
 
 
 
 