document.addEventListener("DOMContentLoaded", function () {
    fetchOrders();
});

// Mở form
function openOrderForm() {
    document.getElementById("order-form").style.display = "block";
}

// Đóng form
function closeOrderForm() {
    document.getElementById("order-form").style.display = "none";
}

// Lấy danh sách đơn hàng từ backend
function fetchOrders() {
    fetch("http://localhost:8080/orders")
        .then(response => response.json())
        .then(data => {
            let orderList = document.getElementById("order-list");
            orderList.innerHTML = "";
            data.forEach(order => {
                let row = `<tr>
                    <td>${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${order.status}</td>
                    <td>${order.totalPrice} VND</td>
                    <td><button onclick="deleteOrder(${order.id})">Xóa</button></td>
                </tr>`;
                orderList.innerHTML += row;
            });
        });
}

// Thêm đơn hàng mới
function createOrder() {
    let customerName = document.getElementById("customer-name").value;
    let totalPrice = document.getElementById("total-price").value;

    if (!customerName || !totalPrice) {
        alert("Vui lòng nhập đủ thông tin!");
        return;
    }

    let newOrder = {
        customerName: customerName,
        totalPrice: parseFloat(totalPrice),
        status: "Chờ xử lý"
    };

    fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
    })
    .then(response => response.json())
    .then(data => {
        alert("Thêm đơn hàng thành công!");
        closeOrderForm();
        fetchOrders();
    })
    .catch(error => console.error("Lỗi:", error));
}

// Xóa đơn hàng
function deleteOrder(orderId) {
    fetch(`http://localhost:8080/orders/${orderId}`, {
        method: "DELETE"
    })
    .then(() => {
        alert("Xóa đơn hàng thành công!");
        fetchOrders();
    })
    .catch(error => console.error("Lỗi:", error));
}
