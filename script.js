document.addEventListener('DOMContentLoaded', function () {
  // Service prices
  const servicePrices = {
    'Giặt quần áo': { price: 60000, unit: 'kg' },
    'ủi đồ': { price: 70000, unit: 'món' },
    'Tẩy vết bẩn': { price: 100000, unit: 'món' }
  };

  // Additional fees
  const additionalFees = {
    'express-delivery': 120000,
    'special-detergent': 70000
  };

  // Cart data
  let cart = [];
  let cartId = 0;

  // DOM elements
  const serviceTypeSelect = document.getElementById('service-type');
  const quantityInput = document.getElementById('quantity');
  const quantityUnitSpan = document.getElementById('quantity-unit');
  const specialNotesTextarea = document.getElementById('special-notes');
  const addServiceForm = document.getElementById('add-service-form');
  const serviceList = document.getElementById('service-list');
  const cartEmptyMessage = document.getElementById('cart-empty');
  const subtotalElement = document.getElementById('subtotal');
  const totalElement = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const additionalFeeCheckboxes = document.querySelectorAll('.additional-fee');

  // Update quantity unit based on selected service
  serviceTypeSelect.addEventListener('change', function () {
    const selectedService = this.value;
    if (selectedService && servicePrices[selectedService]) {
      quantityUnitSpan.textContent = servicePrices[selectedService].unit;
    } else {
      quantityUnitSpan.textContent = '';
    }
  });

  // Add service to cart
  addServiceForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const serviceType = serviceTypeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const specialNotes = specialNotesTextarea.value.trim();

    if (!serviceType || quantity <= 0) {
      alert('Vui lòng chọn dịch vụ và nhập số lượng hợp lệ');
      return;
    }

    const servicePrice = servicePrices[serviceType].price;
    const serviceUnit = servicePrices[serviceType].unit;
    const totalPrice = servicePrice * quantity;

    const serviceItem = {
      id: cartId++,
      type: serviceType,
      quantity: quantity,
      unit: serviceUnit,
      unitPrice: servicePrice,
      totalPrice: totalPrice,
      notes: specialNotes
    };

    cart.push(serviceItem);
    renderCart();
    resetForm();
  });

  // Reset form after adding service
  function resetForm() {
    serviceTypeSelect.value = '';
    quantityInput.value = '1';
    specialNotesTextarea.value = '';
    quantityUnitSpan.textContent = '';
  }

  // Render cart items
  function renderCart() {
    if (cart.length === 0) {
      cartEmptyMessage.style.display = 'block';
      serviceList.innerHTML = '';
      checkoutBtn.disabled = true;
    } else {
      cartEmptyMessage.style.display = 'none';
      checkoutBtn.disabled = false;

      let cartHTML = '';

      cart.forEach(item => {
        cartHTML += `
                    <div class="service-item" data-id="${item.id}">
                        
                        <div class="service-header">
                            <span class="service-type">${item.type}</span>
                            <div class="service-price-block">
                                <span class="service-price">${item.totalPrice.toLocaleString()}đ</span>
                                <button class="remove-btn" onclick="removeService(${item.id})">×</button>
                            </div>
                        </div>
                        
                        <div class="service-details">
                            <div class="service-quantity">
                                <div class="quantity-control">
                                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                                    <span class="quantity-value">${item.quantity} ${item.unit}</span>
                                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                                </div>
                            </div>
                            <div class="unit-price">${item.unitPrice.toLocaleString()}đ/${item.unit}</div>
                        </div>
                        
                        ${item.notes ? `<div class="service-notes">Ghi chú: ${item.notes}</div>` : ''}
                    </div>
                `;
      });

      serviceList.innerHTML = cartHTML;
    }

    calculatePrices();
  }

  // Calculate prices
  function calculatePrices() {
    let subtotal = 0;
    let additionalFeesTotal = 0;

    // Calculate subtotal
    cart.forEach(item => {
      subtotal += item.totalPrice;
    });

    // Calculate additional fees
    additionalFeeCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        additionalFeesTotal += additionalFees[checkbox.id];
      }
    });

    const total = subtotal + additionalFeesTotal;

    // Update price display
    subtotalElement.textContent = `${subtotal.toLocaleString()}đ`;
    totalElement.textContent = `${total.toLocaleString()}đ`;
  }

  // Update quantity
  window.updateQuantity = function (id, change) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
      const newQuantity = cart[index].quantity + change;
      if (newQuantity > 0) {
        cart[index].quantity = newQuantity;
        cart[index].totalPrice = cart[index].unitPrice * newQuantity;
        renderCart();
      }
    }
  };

  // Remove service
  window.removeService = function (id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
  };

  // Listen for changes in additional fees
  additionalFeeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', calculatePrices);
  });

  // Checkout button
  checkoutBtn.addEventListener('click', function () {
    alert('Đang chuyển đến trang thanh toán...');
    // Here you would typically redirect to a checkout page or process the order
  });
});