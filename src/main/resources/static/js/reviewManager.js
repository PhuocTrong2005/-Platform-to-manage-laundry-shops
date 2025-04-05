// Kiểm tra xem reviewManager đã tồn tại chưa
if (typeof reviewManager === 'undefined') {
    window.reviewManager = {
        reviews: [],
        currentShopId: null,
        currentReview: null,

        init(shopId) {
            this.currentShopId = shopId;
            this.loadReviews();
        },

        async loadReviews() {
            try {
                const response = await fetch(`/api/reviews/shop/${this.currentShopId}`);
                if (!response.ok) throw new Error('Failed to load reviews');
                this.reviews = await response.json();
                this.renderReviews();
            } catch (error) {
                console.error('Error loading reviews:', error);
                alert('Không thể tải đánh giá. Vui lòng thử lại sau.');
            }
        },

        async submitReview() {
            const rating = document.getElementById('rating').value;
            const comment = document.getElementById('comment').value;
            const imageFiles = document.getElementById('reviewImages').files;

            if (!rating || !comment) {
                alert('Vui lòng điền đầy đủ thông tin đánh giá');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('rating', rating);
                formData.append('comment', comment);
                formData.append('shopId', this.currentShopId);
                
                // Thêm các file ảnh vào formData
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images', imageFiles[i]);
                }

                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }
                
                alert('Đánh giá đã được gửi thành công!');
                this.loadReviews();
                this.resetForm();
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('Không thể gửi đánh giá: ' + error.message);
            }
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

        renderReviews() {
            const reviewsContainer = document.getElementById('reviewsContainer');
            reviewsContainer.innerHTML = '';

            this.reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-item';
                reviewElement.innerHTML = `
                    <div class="review-header">
                        <div class="review-rating">
                            ${this.renderStars(review.rating)}
                        </div>
                        <div class="review-date">
                            ${new Date(review.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="review-comment">${review.comment}</div>
                    ${this.renderReviewImages(review.images)}
                    <div class="review-actions">
                        <button onclick="reviewManager.editReview(${review.id})" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button onclick="reviewManager.deleteReview(${review.id})" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        },

        renderStars(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<i class="fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}"></i>`;
            }
            return stars;
        },

        renderReviewImages(images) {
            if (!images || images.length === 0) return '';
            
            return `
                <div class="review-images">
                    ${images.map(image => `
                        <img src="${image.imageUrl}" alt="Review image" class="review-image">
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