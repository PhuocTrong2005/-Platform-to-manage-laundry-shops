#!/bin/bash
# Script để triển khai ứng dụng với Docker

# Đảm bảo script dừng nếu có lỗi xảy ra
set -e

echo "=== Triển khai ứng dụng PMLS với Docker ==="

# Kiểm tra Docker đã được cài đặt
if ! command -v docker &> /dev/null; then
    echo "Lỗi: Docker chưa được cài đặt. Vui lòng cài đặt Docker trước khi tiếp tục."
    exit 1
fi

# Kiểm tra Docker Compose đã được cài đặt
if ! command -v docker-compose &> /dev/null; then
    echo "Lỗi: Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước khi tiếp tục."
    exit 1
fi

# Chuyển đến thư mục gốc của dự án (thư mục chứa docker-compose.yml)
cd "$(dirname "$0")/.." || exit 1

# Tìm JDK trên máy
if command -v javac &> /dev/null; then
    JAVA_VERSION=$(javac -version 2>&1 | awk '{print $2}')
    echo "Phát hiện JDK phiên bản: $JAVA_VERSION"
else
    echo "Cảnh báo: Không tìm thấy JDK trong system PATH. Sẽ sử dụng JDK trong Docker."
fi

# Kiểm tra Maven đã được cài đặt
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -v | head -n 1)
    echo "Phát hiện Maven: $MVN_VERSION"
    
    # Build ứng dụng với Maven
    echo "=== Building ứng dụng với Maven ==="
    mvn clean package -DskipTests
else
    echo "Cảnh báo: Maven chưa được cài đặt. Sẽ bỏ qua bước build."
    echo "Đảm bảo file JAR đã tồn tại trong thư mục target."
fi

# Tạo thư mục cho dữ liệu MySQL nếu chưa tồn tại
mkdir -p docker/mysql-data

# Khởi động ứng dụng với Docker Compose
echo "=== Khởi động các container Docker ==="
docker-compose down -v || true  # Dừng và xóa container cũ nếu có
docker-compose up -d --build

# Kiểm tra xem các container đã hoạt động chưa
echo "=== Kiểm tra trạng thái các container ==="
docker-compose ps

echo ""
echo "=== Triển khai hoàn tất ==="
echo "Ứng dụng PMLS đã được triển khai thành công!"
echo "Truy cập ứng dụng tại: http://localhost:8080"
echo ""
echo "Xem logs với lệnh: docker-compose logs -f"
echo "Dừng ứng dụng với lệnh: docker-compose down" 