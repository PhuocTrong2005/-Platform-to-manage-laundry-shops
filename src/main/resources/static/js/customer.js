// Hover effects for cards
document.addEventListener('DOMContentLoaded', function() {
    // Shop card hover effect
    const shopCards = document.querySelectorAll('.shop-card');
    shopCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    });

    // Service tag hover effect
    const serviceTags = document.querySelectorAll('.service-tag');
    serviceTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = '#E5E7EB';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = '#EFF6FF';
        });
    });

    // Order card hover effect
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        });
    });

    // Review card hover effect
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        });
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn-hover');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Table row hover effect
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#F9FAFB';
            this.style.transition = 'background-color 0.3s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });

    // Search input focus effect
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Notification badge animation
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        notificationBadge.style.animation = 'pulse 2s infinite';
    }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add loading animation for buttons
document.querySelectorAll('.btn-loading').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.add('loading');
        setTimeout(() => {
            this.classList.remove('loading');
        }, 2000);
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    .loading {
        position: relative;
        pointer-events: none;
        opacity: 0.8;
    }

    .loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin: -8px 0 0 -8px;
        border: 2px solid #fff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .shop-card, .order-card, .review-card {
        transition: all 0.3s ease;
    }

    .service-tag {
        transition: all 0.2s ease;
    }

    .btn-hover {
        transition: all 0.2s ease;
    }

    tbody tr {
        transition: background-color 0.3s ease;
    }

    .search-input {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Review Management
const reviewManager = {
    reviews: [],
    newReview: {
        rating: 0,
        comment: '',
        shopId: null,
        customerId: null
    },
    editingReview: null,

    init() {
        // Lấy shopId từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const shopId = urlParams.get('shopId');
        
        if (shopId) {
            this.newReview.shopId = parseInt(shopId);
        }

        // Lấy thông tin người dùng từ localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.newReview.customerId = user.userId;
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        if (this.newReview.shopId) {
            this.loadReviews();
        } else {
            console.warn('Không tìm thấy shopId. Vui lòng chọn cửa hàng trước khi xem đánh giá.');
        }
    },

    async loadReviews() {
        try {
            const response = await fetch(`/api/reviews/shop/${this.newReview.shopId}`);
            if (!response.ok) throw new Error('Failed to load reviews');
            this.reviews = await response.json();
            this.renderReviews();
        } catch (error) {
            console.error('Error loading reviews:', error);
            alert('Không thể tải đánh giá. Vui lòng thử lại sau.');
        }
    },

    async submitReview() {
        if (!this.newReview.rating || !this.newReview.comment) {
            alert('Vui lòng điền đầy đủ thông tin đánh giá');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('rating', this.newReview.rating);
            formData.append('comment', this.newReview.comment);
            formData.append('shopId', this.newReview.shopId);
            formData.append('customerId', this.newReview.customerId);

            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to submit review');
            
            alert('Đánh giá đã được gửi thành công!');
            this.newReview.rating = 0;
            this.newReview.comment = '';
            this.loadReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
        }
    },

    async updateReview() {
        if (!this.editingReview || !this.editingReview.rating || !this.editingReview.comment) {
            alert('Vui lòng điền đầy đủ thông tin đánh giá');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('rating', this.editingReview.rating);
            formData.append('comment', this.editingReview.comment);

            const response = await fetch(`/api/reviews/${this.editingReview.id}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update review');
            
            alert('Đánh giá đã được cập nhật thành công!');
            this.editingReview = null;
            this.loadReviews();
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Không thể cập nhật đánh giá. Vui lòng thử lại sau.');
        }
    },

    async deleteReview(reviewId) {
        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete review');
            
            alert('Đánh giá đã được xóa thành công!');
            this.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Không thể xóa đánh giá. Vui lòng thử lại sau.');
        }
    },

    editReview(review) {
        this.editingReview = { ...review };
    },

    renderReviews() {
        const reviewsContainer = document.getElementById('reviews-container');
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = this.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                    <div class="review-date">
                        ${new Date(review.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="review-comment">${review.comment}</div>
                <div class="review-actions">
                    <button @click="reviewManager.editReview(${JSON.stringify(review)})" class="btn-edit">
                        Sửa
                    </button>
                    <button @click="reviewManager.deleteReview(${review.id})" class="btn-delete">
                        Xóa
                    </button>
                </div>
            </div>
        `).join('');
    }
};

// Các bộ xử lý sự kiện cho khách hàng
window.customerManager = {
    init() {
        console.log('Customer Manager initialized');
        this.loadShops();
    },

    async loadShops() {
        try {
            console.log('Đang tải danh sách cửa hàng từ API...');
            
            // Tải danh sách cửa hàng từ API
            const response = await fetch('/api/shops');
            if (!response.ok) {
                throw new Error(`API trả về lỗi ${response.status}`);
            }
            
            // Chuyển đổi dữ liệu trả về từ API
            const shops = await response.json();
            console.log('Đã tải danh sách cửa hàng:', shops);
            
            // Xử lý dữ liệu và chuẩn bị cho hiển thị
            const formattedShops = await Promise.all(shops.map(async (shop) => {
                // Tải danh sách dịch vụ của từng cửa hàng
                let services = [];
                try {
                    const serviceResponse = await fetch(`/api/services/shop/${shop.id}`);
                    if (serviceResponse.ok) {
                        services = await serviceResponse.json();
                        console.log(`Đã tải ${services.length} dịch vụ cho shop ${shop.id}`);
                    }
                } catch (error) {
                    console.warn(`Không thể tải dịch vụ cho shop ${shop.id}:`, error);
                }
                
                // Tạo URL ảnh ngẫu nhiên
                const imageIds = [
                    'photo-1604335399105-a0c585fd81a1',
                    'photo-1545173168-9f1947eebb7f',
                    'photo-1469504512102-900f29606341',
                    'photo-1521656693074-0ef32e80a5d5',
                    'photo-1582735689369-59a42852021a'
                ];
                const randomImageId = imageIds[Math.floor(Math.random() * imageIds.length)];
                
                return {
                    id: shop.id,
                    shopName: shop.shopName,
                    location: shop.location,
                    rating: 4.5 + Math.random() * 0.5, // Đánh giá ngẫu nhiên từ 4.5-5.0
                    reviewCount: Math.floor(50 + Math.random() * 150), // Số lượng đánh giá ngẫu nhiên
                    operatingHours: shop.operatingHours || '08:00 - 20:00',
                    image: `https://images.unsplash.com/${randomImageId}`,
                    services: services.map(service => service.serviceName),
                    servicesData: services // Lưu trữ dữ liệu dịch vụ đầy đủ
                };
            }));
            
            // Render danh sách cửa hàng
            this.renderShops(formattedShops);
            
        } catch (error) {
            console.error('Lỗi khi tải danh sách cửa hàng:', error);
            
            // Dữ liệu mẫu nếu có lỗi
            const fallbackShops = [
                {
                    id: 1,
                    shopName: 'Tiệm giặt ủi Premium',
                    location: '123 Nguyễn Huệ, Quận 1, TP.HCM',
                    rating: 4.8,
                    reviewCount: 156,
                    operatingHours: '07:00 - 21:00',
                    image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1',
                    services: ['Giặt ủi thường', 'Giặt khô', 'Giặt nhanh', 'Giặt đồ da']
                },
                {
                    id: 2,
                    shopName: 'Laundry Express',
                    location: '45 Lê Lợi, Quận 1, TP.HCM',
                    rating: 4.5,
                    reviewCount: 98,
                    operatingHours: '08:00 - 20:00',
                    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f',
                    services: ['Giặt ủi thường', 'Giặt khô', 'Giặt nhanh']
                },
                {
                    id: 3,
                    shopName: 'Clean & Fresh',
                    location: '78 Trần Hưng Đạo, Quận 5, TP.HCM',
                    rating: 4.2,
                    reviewCount: 75,
                    operatingHours: '07:30 - 19:30',
                    image: 'https://images.unsplash.com/photo-1469504512102-900f29606341',
                    services: ['Giặt ủi thường', 'Giặt nhanh', 'Giặt màn cửa']
                }
            ];
            
            this.renderShops(fallbackShops);
        }
    },
    
    renderShops(shops) {
        console.log('Rendering shops:', shops);
        const container = document.getElementById('shops-container');
        const template = document.getElementById('shop-card-template');
        
        if (!container) {
            console.error('Không tìm thấy container shops-container');
            return;
        }
        
        if (!template) {
            console.error('Không tìm thấy template shop-card-template');
            return;
        }
        
        // Xóa nội dung cũ
        container.innerHTML = '';
        
        // Thêm các shop mới
        shops.forEach(shop => {
            const shopCard = template.content.cloneNode(true);
            
            // Cập nhật thông tin shop
            shopCard.querySelector('.shop-name').textContent = shop.shopName;
            shopCard.querySelector('.shop-address').textContent = shop.location;
            shopCard.querySelector('.shop-rating').textContent = shop.rating.toFixed(1);
            shopCard.querySelector('.shop-reviews').textContent = `(${shop.reviewCount})`;
            shopCard.querySelector('.shop-hours').textContent = shop.operatingHours;
            
            // Cập nhật hình ảnh
            const shopImage = shopCard.querySelector('.shop-image');
            shopImage.src = shop.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f';
            shopImage.alt = shop.shopName;
            
            // Thêm tags dịch vụ
            const servicesContainer = shopCard.querySelector('.shop-services');
            servicesContainer.innerHTML = '';
            shop.services.forEach(service => {
                const tag = document.createElement('span');
                tag.className = 'service-tag bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded';
                tag.textContent = service;
                servicesContainer.appendChild(tag);
            });
            
            // Tạo wrapper cho shop card và lưu shop ID
            const shopWrapper = document.createElement('div');
            shopWrapper.className = 'shop-card-wrapper';
            shopWrapper.dataset.shopId = shop.id;
            shopWrapper.appendChild(shopCard);
            
            // Thêm vào container
            container.appendChild(shopWrapper);
            
            // Thêm sự kiện click cho nút xem dịch vụ
            const viewBtn = shopWrapper.querySelector('.view-shop-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => {
                    console.log('Click vào nút xem chi tiết shop:', shop.id);
                    if (window.orderManager) {
                        window.orderManager.showShopDetails(shop.id);
                    } else {
                        console.error('Không tìm thấy orderManager');
                        alert('Không thể hiển thị chi tiết cửa hàng. Vui lòng làm mới trang và thử lại!');
                    }
                });
            }
        });
        
        console.log(`Đã render ${shops.length} cửa hàng`);
    },
    
    filterShops() {
        const searchInput = document.getElementById('shop-search');
        const serviceFilter = document.getElementById('service-filter');
        
        if (!searchInput || !serviceFilter) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const selectedService = serviceFilter.value;
        
        // Lọc các shop card
        const shopCards = document.querySelectorAll('.shop-card-wrapper');
        shopCards.forEach(card => {
            const shopName = card.querySelector('.shop-name').textContent.toLowerCase();
            const shopAddress = card.querySelector('.shop-address').textContent.toLowerCase();
            const servicesElements = card.querySelectorAll('.service-tag');
            const services = Array.from(servicesElements).map(el => el.textContent);
            
            // Kiểm tra điều kiện tìm kiếm
            const matchesSearch = shopName.includes(searchTerm) || shopAddress.includes(searchTerm);
            const matchesService = !selectedService || services.some(service => service === selectedService);
            
            // Hiển thị hoặc ẩn card
            if (matchesSearch && matchesService) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
};

// Khởi tạo customerManager khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('Khởi tạo Customer Manager...');
    
    // Kiểm tra và khởi tạo orderManager nếu chưa có
    if (!window.orderManager) {
        console.error('OrderManager không tồn tại! Tạo phiên bản tạm thời...');
        
        window.orderManager = {
            orderData: { cart: [] },
            init: function() {
                console.log('Khởi tạo OrderManager');
                this.loadCart();
            },

            loadCart: function() {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    try {
                        this.orderData.cart = JSON.parse(savedCart);
                        this.updateCartDisplay();
                    } catch (error) {
                        console.error('Lỗi khi tải giỏ hàng:', error);
                        this.orderData.cart = [];
                    }
                }
            },

            saveCart: function() {
                localStorage.setItem('cart', JSON.stringify(this.orderData.cart));
            },

            showShopDetails: async function(shopId) {
                console.log('Hiển thị chi tiết cửa hàng ID:', shopId);
                
                try {
                    // Lấy thông tin cửa hàng
                    let shopData = null;
                    
                    try {
                        // Thử lấy dữ liệu từ API
                        const shopResponse = await fetch(`/api/shops/${shopId}`);
                        if (!shopResponse.ok) throw new Error('API không có sẵn');
                        
                        shopData = await shopResponse.json();
                        
                        // Lấy danh sách dịch vụ
                        const servicesResponse = await fetch(`/api/services/shop/${shopId}`);
                        if (!servicesResponse.ok) throw new Error('API dịch vụ không có sẵn');
                        
                        const services = await servicesResponse.json();
                        
                        // Thêm thông tin về dịch vụ vào shopData
                        shopData.services = services.map(service => ({
                            id: service.id,
                            serviceName: service.serviceName,
                            price: service.price,
                            description: service.description || `Dịch vụ ${service.serviceName} chất lượng cao`
                        }));
                        
                    } catch (error) {
                        console.warn('Không thể lấy dữ liệu từ API:', error.message);
                        
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
                    
                    // Hiển thị modal
                    this.createShopModal(shopData);
                    
                } catch (error) {
                    console.error('Lỗi khi hiển thị chi tiết cửa hàng:', error);
                    alert('Không thể hiển thị chi tiết cửa hàng. Vui lòng thử lại sau!');
                }
            },

            createShopModal: function(shopData) {
                // Tạo modal hiển thị thông tin cửa hàng
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
                
                // Tạo nội dung HTML của modal
                const modalContent = `
                    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div class="flex justify-between items-center border-b pb-4 mb-4">
                            <h3 class="text-2xl font-semibold">${shopData.shopName}</h3>
                            <button class="close-modal text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <div class="mb-3">
                                    <span class="text-sm text-gray-500">Địa chỉ:</span>
                                    <p>${shopData.location}</p>
                                </div>
                                <div class="mb-3">
                                    <span class="text-sm text-gray-500">Giờ hoạt động:</span>
                                    <p>${shopData.operatingHours}</p>
                                </div>
                                <div class="mb-3">
                                    <span class="text-sm text-gray-500">Đánh giá:</span>
                                    <div class="flex items-center">
                                        <span class="text-yellow-400 mr-1"><i class="fas fa-star"></i></span>
                                        <span>${shopData.rating}</span>
                                        <span class="text-gray-500 ml-1">(${shopData.reviewCount})</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col justify-between">
                                <div>
                                    <span class="text-sm text-gray-500 mb-2 block">Thời gian giao nhận:</span>
                                    <div class="flex gap-2 mb-4">
                                        <input type="date" id="schedule-date" class="border p-2 rounded" value="${new Date().toISOString().split('T')[0]}">
                                        <input type="time" id="schedule-time" class="border p-2 rounded" value="10:00">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="text-lg font-medium mb-4">Dịch vụ có sẵn</h4>
                            <div class="space-y-4 services-container">
                                ${shopData.services.map(service => `
                                    <div class="border p-4 rounded-lg service-item">
                                        <div class="flex justify-between items-center mb-2">
                                            <h5 class="font-medium">${service.serviceName}</h5>
                                            <span class="font-semibold">${this.formatPrice(service.price)}</span>
                                        </div>
                                        <p class="text-gray-600 text-sm mb-3">${service.description}</p>
                                        <div class="flex justify-between items-center">
                                            <div class="flex items-center">
                                                <button class="quantity-decrease w-8 h-8 border rounded-l flex items-center justify-center bg-gray-100">-</button>
                                                <input type="number" class="service-quantity w-16 h-8 border-t border-b text-center" min="1" max="20" value="1">
                                                <button class="quantity-increase w-8 h-8 border rounded-r flex items-center justify-center bg-gray-100">+</button>
                                            </div>
                                            <button class="add-to-cart bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
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
                            <button class="schedule-pickup bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                                <i class="fas fa-calendar-alt mr-1"></i>Đặt lịch hẹn
                            </button>
                            <button class="view-cart bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                                <i class="fas fa-shopping-cart mr-1"></i>Xem giỏ hàng
                            </button>
                        </div>
                    </div>
                `;
                
                // Thêm nội dung vào modal
                modal.innerHTML = modalContent;
                document.body.appendChild(modal);
                
                // Xử lý sự kiện đóng modal
                modal.querySelectorAll('.close-modal').forEach(btn => {
                    btn.addEventListener('click', () => modal.remove());
                });
                
                // Xử lý sự kiện xem giỏ hàng
                modal.querySelector('.view-cart').addEventListener('click', () => {
                    modal.remove();
                    const cartSidebar = document.querySelector('.cart-sidebar');
                    if (cartSidebar) {
                        cartSidebar.classList.remove('translate-x-full');
                    } else {
                        alert('Không tìm thấy giỏ hàng trong giao diện.');
                    }
                });
                
                // Xử lý sự kiện tăng/giảm số lượng
                modal.querySelectorAll('.service-quantity').forEach(input => {
                    const decreaseBtn = input.parentElement.querySelector('.quantity-decrease');
                    const increaseBtn = input.parentElement.querySelector('.quantity-increase');
                    
                    decreaseBtn.addEventListener('click', () => {
                        const currentValue = parseInt(input.value);
                        if (currentValue > 1) {
                            input.value = currentValue - 1;
                        }
                    });
                    
                    increaseBtn.addEventListener('click', () => {
                        const currentValue = parseInt(input.value);
                        if (currentValue < 20) {
                            input.value = currentValue + 1;
                        }
                    });
                });
                
                // Xử lý sự kiện thêm vào giỏ hàng
                modal.querySelectorAll('.add-to-cart').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const serviceId = parseInt(btn.dataset.serviceId);
                        const serviceName = btn.dataset.serviceName;
                        const servicePrice = parseInt(btn.dataset.servicePrice);
                        const quantityInput = btn.closest('.service-item').querySelector('.service-quantity');
                        const quantity = parseInt(quantityInput.value);
                        
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
                
                // Xử lý sự kiện đặt lịch hẹn
                modal.querySelector('.schedule-pickup').addEventListener('click', () => {
                    const scheduleDate = document.getElementById('schedule-date').value;
                    const scheduleTime = document.getElementById('schedule-time').value;
                    
                    if (!scheduleDate || !scheduleTime) {
                        alert('Vui lòng chọn ngày và giờ hẹn');
                        return;
                    }
                    
                    alert(`Đã đặt lịch hẹn tại ${shopData.shopName} vào ngày ${scheduleDate} lúc ${scheduleTime}`);
                });
            },

            addToCart: function(service) {
                console.log('Thêm vào giỏ hàng:', service);
                
                // Kiểm tra xem dịch vụ đã có trong giỏ hàng chưa
                const existingItem = this.orderData.cart.find(item => 
                    item.id === service.id && item.shopId === service.shopId
                );
                
                if (existingItem) {
                    existingItem.quantity += service.quantity;
                } else {
                    this.orderData.cart.push(service);
                }
                
                // Lưu giỏ hàng
                this.saveCart();
                
                // Cập nhật hiển thị
                this.updateCartDisplay();
                
                // Hiển thị thông báo
                alert(`Đã thêm ${service.quantity} ${service.name} vào giỏ hàng`);
            },

            removeFromCart: function(serviceId, shopId) {
                this.orderData.cart = this.orderData.cart.filter(item => 
                    !(item.id === serviceId && item.shopId === shopId)
                );
                this.saveCart();
                this.updateCartDisplay();
            },

            updateCartItemQuantity: function(serviceId, shopId, newQuantity) {
                const item = this.orderData.cart.find(item => 
                    item.id === serviceId && item.shopId === shopId
                );
                
                if (item) {
                    item.quantity = parseInt(newQuantity);
                    this.saveCart();
                    this.updateCartDisplay();
                }
            },

            updateCartDisplay: function() {
                // Cập nhật số lượng trên badge giỏ hàng
                const cartBadge = document.querySelector('.cart-badge');
                if (cartBadge) {
                    const totalItems = this.orderData.cart.reduce((total, item) => total + item.quantity, 0);
                    cartBadge.textContent = totalItems;
                    cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
                }
                
                // Cập nhật giỏ hàng trong Alpine.js nếu có
                const alpineData = document.querySelector('[x-data]')?._x_dataStack?.[0];
                if (alpineData && typeof alpineData.syncCartWithOrderManager === 'function') {
                    alpineData.syncCartWithOrderManager();
                }
            },

            clearCart: function() {
                this.orderData.cart = [];
                this.saveCart();
                this.updateCartDisplay();
            },

            formatPrice: function(price) {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0
                }).format(price);
            }
        };
        
        // Khởi tạo OrderManager
        window.orderManager.init();
    }
    
    // Khởi tạo customerManager
    if (window.customerManager) {
        window.customerManager.init();
    }
}); 