# Phú Mỹ Laundry Service (PMLS)

PMLS là một ứng dụng web giúp người dùng tìm kiếm, đặt dịch vụ giặt ủi và đánh giá các cửa hàng giặt ủi.

## Yêu cầu hệ thống

- [Docker](https://www.docker.com/products/docker-desktop) (phiên bản 19.03 trở lên)
- [Docker Compose](https://docs.docker.com/compose/install/) (phiên bản 1.27 trở lên)

## Triển khai với Docker

### Bước 1: Chuẩn bị

Đảm bảo bạn đã tải mã nguồn của dự án. Bạn có thể clone từ repository hoặc giải nén file ZIP:

```bash
git clone <repository-url>
# hoặc giải nén file zip đã tải về
```

### Bước 2: Build ứng dụng

Chuyển đến thư mục gốc của dự án và build ứng dụng với Maven:

```bash
cd project
mvn clean package -DskipTests
```

Lệnh này sẽ tạo ra file JAR trong thư mục `target`.

### Bước 3: Khởi động ứng dụng với Docker Compose

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build Docker image từ Dockerfile
- Tạo và khởi động container cho ứng dụng Spring Boot
- Tạo và khởi động container MySQL
- Thiết lập network giữa các container
- Cấu hình persistent volume cho dữ liệu MySQL

### Bước 4: Truy cập ứng dụng

Sau khi các container đã khởi động thành công, bạn có thể truy cập ứng dụng tại:

```
http://localhost:8080
```

## Quản lý ứng dụng Docker

### Kiểm tra trạng thái các container

```bash
docker-compose ps
```

### Xem logs

```bash
docker-compose logs -f
```

### Dừng ứng dụng

```bash
docker-compose down
```

### Dừng ứng dụng và xóa volume dữ liệu

```bash
docker-compose down -v
```

## Đóng gói và triển khai trên máy khác

Dự án cung cấp các script để đơn giản hóa việc triển khai trên máy khác. Có hai cách để làm điều này:

### Cách 1: Sử dụng script đóng gói tự động

1. Chạy script đóng gói tự động từ thư mục gốc của dự án:

```bash
scripts/create-zip-package.bat  # Windows
```

2. Script sẽ tạo một file ZIP chứa tất cả các file cần thiết để triển khai ứng dụng trên máy khác.

3. Sao chép file ZIP này sang máy khác và giải nén.

4. Trên máy đích, chạy script triển khai:

```bash
build-and-deploy.bat  # Windows
```

Script này cung cấp menu để:
- Build và triển khai ứng dụng
- Chỉ build ứng dụng
- Chỉ triển khai (nếu đã build)
- Dừng hoặc xóa các container

### Cách 2: Sao chép các file cần thiết thủ công

1. Sao chép các file và thư mục sau sang máy đích:
   - `Dockerfile`
   - `docker-compose.yml`
   - `.env` (tạo mới hoặc sửa đổi nếu cần)
   - `pom.xml`
   - `src/` (thư mục mã nguồn)
   - `scripts/` (thư mục chứa các script hỗ trợ)
   - `build-and-deploy.bat`
   - `README.md`

2. Trên máy đích, đảm bảo đã cài đặt Docker, Docker Compose và Java (nếu muốn build ứng dụng tại máy đích).

3. Chạy script triển khai:

```bash
build-and-deploy.bat  # Windows
```

## Cấu hình cho máy chủ production

Khi triển khai trên máy chủ production, bạn nên chỉnh sửa file `.env` để:

1. Thay đổi mật khẩu cơ sở dữ liệu
2. Thiết lập persistent volume tại vị trí phù hợp
3. Cấu hình các biến môi trường cho ứng dụng Spring Boot

## Giải quyết sự cố

1. **Không thể truy cập ứng dụng**: Kiểm tra logs với lệnh `docker-compose logs -f app`
2. **Lỗi kết nối cơ sở dữ liệu**: Kiểm tra logs với lệnh `docker-compose logs -f db`
3. **Khởi động lại container**: `docker-compose restart app` hoặc `docker-compose restart db`

## Môi trường giả lập (Simulation Mode)

Ứng dụng có hỗ trợ môi trường giả lập cho việc thử nghiệm mà không cần kết nối cơ sở dữ liệu. Chế độ này được cấu hình trong file `src/main/resources/static/js/debug/laundryConfig.js`.

## Đóng góp

Vui lòng xem tài liệu CONTRIBUTING.md để biết chi tiết về quy trình đóng góp cho dự án. 