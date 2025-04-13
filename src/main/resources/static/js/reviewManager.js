// Kiểm tra xem reviewManager đã tồn tại chưa
if (typeof reviewManager === 'undefined') {
    window.reviewManager = {
        reviews: [],
        currentShopId: null,
        currentReview: null,

        init: function() {
            console.log('Initializing review manager...');
            
            // Kiểm tra và lấy shopId từ URL hoặc data attribute
            const shopIdFromPage = document.querySelector('[data-shop-id]')?.dataset.shopId;
            if (shopIdFromPage) {
                this.currentShopId = parseInt(shopIdFromPage);
                console.log('Shop ID set from page:', this.currentShopId);
            }
            
            // Đăng ký listener cho Alpine.js để lắng nghe sự kiện khi user thay đổi tab
            document.addEventListener('alpine:initialized', () => {
                this.loadReviews();
            });
            
            // Đăng ký listener cho component review form khi nó được khởi tạo
            document.addEventListener('reviewFormInitialized', (event) => {
                console.log('Review form initialized:', event.detail);
            });
            
            // Đăng ký listener khi alpine component được cập nhật
            document.addEventListener('reviewDataUpdated', (event) => {
                console.log('Review data updated:', event.detail);
            });
            
            // Tự động load reviews
            this.loadReviews();
            
            console.log('Review manager initialized');
        },

        loadReviews: function() {
            console.log('Đang tải đánh giá từ server...');
            
            // Nếu đang trong chế độ simulation, hiển thị reviews giả
            if (window.laundryConfig && window.laundryConfig.simulationMode) {
                console.log('Phát hiện chế độ simulation, sử dụng dữ liệu mẫu');
                if (window.laundryConfig.reviews && window.laundryConfig.reviews.mockData) {
                    this.reviews = window.laundryConfig.reviews.mockData;
                } else {
                    // Dữ liệu mẫu mặc định nếu không có mockData
                    this.reviews = [
                        {
                            id: 1,
                            customerId: 1,
                            customerName: 'Nguyễn Văn A',
                            rating: 5,
                            comment: 'Dịch vụ rất tốt, giặt sạch và giao hàng đúng hẹn!',
                            createdAt: new Date().toISOString(),
                            images: []
                        },
                        {
                            id: 2,
                            customerId: 2,
                            customerName: 'Trần Thị B',
                            rating: 4,
                            comment: 'Tôi hài lòng với dịch vụ, nhưng giao hàng hơi trễ một chút.',
                            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                            images: []
                        }
                    ];
                }
                console.log('Dữ liệu mẫu:', this.reviews);
                this.renderReviews();
                return;
            }
            
            // Chuẩn bị URL cho API
            let url = '/api/reviews';
            
            // Lấy shopId từ URL nếu đang ở trang customer
            const urlParams = new URLSearchParams(window.location.search);
            const shopId = urlParams.get('shopId');
            
            if (shopId) {
                this.currentShopId = parseInt(shopId);
                console.log('Đã tìm thấy shopId từ URL:', this.currentShopId);
            } else {
                // Thử lấy từ data attribute
                const shopElement = document.querySelector('[data-shop-id]');
                if (shopElement) {
                    this.currentShopId = parseInt(shopElement.dataset.shopId);
                    console.log('Đã tìm thấy shopId từ data attribute:', this.currentShopId);
                }
            }
            
            // Hiển thị trạng thái đang tải
            const container = document.getElementById('reviews-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-6">
                        <p class="text-gray-500">Đang tải đánh giá...</p>
                    </div>
                `;
            }
            
            // Nếu đang xem shop cụ thể, lấy reviews của shop đó
            if (this.currentShopId) {
                url = `/api/reviews/shop/${this.currentShopId}`;
                console.log(`Tải đánh giá cho shop ID: ${this.currentShopId}`);
            } 
            // Nếu đang ở trang customer, lấy tất cả reviews của customer hiện tại
            else if (window.location.pathname.includes('/admin/customer')) {
                const userId = localStorage.getItem('userId');
                if (userId) {
                    url = `/api/customers/${userId}/reviews`;
                    console.log(`Tải đánh giá của customer ID: ${userId}`);
                } else {
                    console.warn('Không tìm thấy userId trong localStorage');
                }
            } else {
                console.log('Tải tất cả đánh giá');
            }
            
            console.log('Gọi API:', url);
            
            // Tải dữ liệu từ API
            fetch(url)
                .then(response => {
                    console.log('Phản hồi từ API:', response);
                    if (!response.ok) {
                        throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Đã nhận dữ liệu từ API:', data);
                    
                    if (!data) {
                        console.warn('API trả về dữ liệu rỗng');
                        this.reviews = [];
                    } else if (Array.isArray(data)) {
                        console.log('API trả về mảng đánh giá');
                        this.reviews = data;
                    } else if (data.content && Array.isArray(data.content)) {
                        console.log('API trả về đối tượng phân trang');
                        this.reviews = data.content;
                    } else {
                        console.warn('API trả về định dạng không mong muốn, đã chuyển đổi');
                        this.reviews = [data]; // Chuyển đổi thành mảng nếu chỉ nhận được 1 đánh giá
                    }
                    
                    this.renderReviews();
                })
                .catch(error => {
                    console.error('Lỗi khi tải đánh giá:', error);
                    
                    // Hiển thị thông báo lỗi
                    if (container) {
                        container.innerHTML = `
                            <div class="text-center py-6">
                                <p class="text-red-500">Không thể tải đánh giá: ${error.message}</p>
                                <button onclick="reviewManager.loadReviews()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Thử lại
                                </button>
                            </div>
                        `;
                    }
                    
                    this.reviews = [];
                    // Không gọi renderReviews ở đây vì đã hiển thị thông báo lỗi
                });
        },

        submitReview: function(reviewData) {
            console.log('Submitting review...', reviewData);
            
            // Validate dữ liệu
            if (!reviewData) {
                console.error('No review data provided');
                alert('Không có dữ liệu đánh giá');
                return false;
            }
            
            if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
                console.error('Invalid rating:', reviewData.rating);
                alert('Vui lòng chọn số sao đánh giá (1-5)');
                return false;
            }
            
            if (!reviewData.comment || reviewData.comment.trim().length < 10) {
                console.error('Comment too short:', reviewData.comment);
                alert('Vui lòng nhập nhận xét ít nhất 10 ký tự');
                return false;
            }
            
            // Kiểm tra user đã đăng nhập chưa
            const userId = localStorage.getItem('userId');
            const userFullName = localStorage.getItem('userFullName');
            
            if (!userId && !window.laundryConfig?.simulationMode) {
                console.error('User not logged in');
                alert('Vui lòng đăng nhập để gửi đánh giá');
                return false;
            }
            
            // Thiết lập customerId nếu chưa có
            if (!reviewData.customerId && userId) {
                reviewData.customerId = parseInt(userId);
            }
            
            // Kiểm tra có shopId chưa
            if (!reviewData.shopId && this.currentShopId) {
                reviewData.shopId = this.currentShopId;
            }
            
            if (!reviewData.shopId) {
                console.error('No shop ID provided');
                alert('Vui lòng chọn cửa hàng để đánh giá');
                return false;
            }
            
            // Nếu đang trong chế độ simulation, thêm review vào danh sách giả
            if (window.laundryConfig && window.laundryConfig.simulationMode) {
                console.log('Simulation mode active, adding mock review');
                
                // Tạo review giả
                const mockReview = {
                    id: Date.now(),
                    customerId: reviewData.customerId || 999,
                    customerName: userFullName || 'Người dùng giả lập',
                    shopId: reviewData.shopId,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    createdAt: new Date().toISOString(),
                    images: []
                };
                
                // Thêm vào danh sách và render lại
                if (!this.reviews) this.reviews = [];
                this.reviews.unshift(mockReview);
                this.renderReviews();
                
                // Thông báo thành công
                alert('Đánh giá của bạn đã được gửi thành công!');
                
                // Reset form trong Alpine component nếu có
                const alpineComponent = document.querySelector('[x-data]')?.__x;
                if (alpineComponent && typeof alpineComponent.evaluateLater === 'function') {
                    alpineComponent.evaluateLater('resetForm()')();
                }
                
                // Trigger custom event
                const event = new CustomEvent('reviewSubmitted', { detail: { review: mockReview } });
                document.dispatchEvent(event);
                
                return true;
            }
            
            // Gửi đánh giá lên server
            fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(savedReview => {
                console.log('Review saved successfully:', savedReview);
                
                // Thêm customerName cho review mới
                savedReview.customerName = userFullName || 'Người dùng';
                
                // Thêm vào danh sách và render lại
                if (!this.reviews) this.reviews = [];
                this.reviews.unshift(savedReview);
                this.renderReviews();
                
                // Thông báo thành công
                alert('Đánh giá của bạn đã được gửi thành công!');
                
                // Reset form trong Alpine component nếu có
                const alpineComponent = document.querySelector('[x-data]')?.__x;
                if (alpineComponent && typeof alpineComponent.evaluateLater === 'function') {
                    alpineComponent.evaluateLater('resetForm()')();
                }
                
                // Trigger custom event
                const event = new CustomEvent('reviewSubmitted', { detail: { review: savedReview } });
                document.dispatchEvent(event);
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
            });
            
            return true;
        },

        async updateReview(reviewId) {
            const rating = document.getElementById('editRating').value;
            const comment = document.getElementById('editComment').value;
            const imageFiles = document.getElementById('editReviewImages').files;

            if (!rating || !comment) {
                alert('Vui lòng điền đầy đủ thông tin đánh giá');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('rating', rating);
                formData.append('comment', comment);
                
                // Thêm các file ảnh mới vào formData
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images', imageFiles[i]);
                }

                const response = await fetch(`/api/reviews/${reviewId}`, {
                    method: 'PUT',
                    body: formData
                });

                if (!response.ok) throw new Error('Failed to update review');
                
                alert('Đánh giá đã được cập nhật thành công!');
                this.loadReviews();
                this.closeEditModal();
            } catch (error) {
                console.error('Error updating review:', error);
                alert('Không thể cập nhật đánh giá. Vui lòng thử lại sau.');
            }
        },

        async deleteReview(reviewId) {
            if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                return;
            }

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

        renderReviews: function() {
            console.log('Đang render đánh giá...');
            const container = document.getElementById('reviews-container');
            
            if (!container) {
                console.error('Không tìm thấy reviews-container, không thể hiển thị đánh giá');
                return;
            }
            
            // Xóa nội dung cũ
            container.innerHTML = '';
            
            // Kiểm tra có đánh giá không
            if (!this.reviews || this.reviews.length === 0) {
                console.log('Không có đánh giá nào, hiển thị thông báo trống');
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-comment-slash text-4xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500">Chưa có đánh giá nào</p>
                    </div>
                `;
                return;
            }
            
            console.log(`Đang hiển thị ${this.reviews.length} đánh giá`);
            
            // Render reviews
            this.reviews.forEach((review, index) => {
                console.log(`Rendering review #${index + 1}:`, review);
                
                const reviewElem = document.createElement('div');
                reviewElem.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
                
                const customerName = review.customerName || (review.customer ? review.customer.name : 'Khách hàng');
                const reviewDate = review.createdAt ? this.formatDate(review.createdAt) : 'Không rõ ngày';
                
                reviewElem.innerHTML = `
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="font-medium text-lg">${customerName}</h3>
                            <p class="text-sm text-gray-500">${reviewDate}</p>
                        </div>
                        <div class="text-yellow-400 text-xl">
                            ${this.renderStars(review.rating)}
                        </div>
                    </div>
                    <p class="text-gray-700 mb-4">${review.comment || ''}</p>
                `;
                
                // Add images if any
                if (review.images && review.images.length > 0) {
                    console.log(`Review có ${review.images.length} hình ảnh`);
                    const imagesContainer = document.createElement('div');
                    imagesContainer.className = 'grid grid-cols-2 gap-4 mt-4';
                    
                    review.images.forEach(image => {
                        const img = document.createElement('img');
                        img.src = image.url || image;
                        img.alt = 'Review image';
                        img.className = 'rounded-md w-full h-auto object-cover';
                        imagesContainer.appendChild(img);
                    });
                    
                    reviewElem.appendChild(imagesContainer);
                }
                
                container.appendChild(reviewElem);
            });
            
            console.log('Hoàn tất việc hiển thị đánh giá');
        },

        formatDate: function(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('vi-VN', options);
        },

        renderStars: function(rating) {
            return '★'.repeat(rating) + '☆'.repeat(5 - rating);
        },

        renderReviewImages(images) {
            if (!images || images.length === 0) return '';
            
            return `
                <div class="review-images">
                    ${images.map(image => `                        <img src="${image.imageUrl}" alt="Review image" class="review-image">
                    `).join('')}
                </div>
            `;
        },

        editReview(reviewId) {
            const review = this.reviews.find(r => r.id === reviewId);
            if (!review) return;

            this.currentReview = review;
            document.getElementById('editRating').value = review.rating;
            document.getElementById('editComment').value = review.comment;
            
            // Hiển thị modal chỉnh sửa
            document.getElementById('editReviewModal').style.display = 'block';
        },

        closeEditModal() {
            document.getElementById('editReviewModal').style.display = 'none';
            this.currentReview = null;
            this.resetEditForm();
        },

        resetForm() {
            document.getElementById('rating').value = '';
            document.getElementById('comment').value = '';
            document.getElementById('reviewImages').value = '';
        },

        resetEditForm() {
            document.getElementById('editRating').value = '';
            document.getElementById('editComment').value = '';
            document.getElementById('editReviewImages').value = '';
        }
    };
} 

// Tự động khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    reviewManager.init();
}); 
