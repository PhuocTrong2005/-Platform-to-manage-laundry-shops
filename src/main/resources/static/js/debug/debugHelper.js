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
 
 