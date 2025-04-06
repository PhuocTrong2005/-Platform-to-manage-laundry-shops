# Hướng dẫn sử dụng Docker cho dự án PMLS

## Yêu cầu hệ thống
- Docker: 20.10.x trở lên
- Docker Compose: 1.29.x trở lên

## Cách build và chạy dự án với Docker

### 1. Build ứng dụng Spring Boot
Trước tiên, bạn cần build file JAR của ứng dụng Spring Boot:

```bash
./mvnw clean package -DskipTests
```

### 2. Chạy ứng dụng với Docker Compose
```bash
docker-compose up -d
```

Lệnh này sẽ:
- Tạo và khởi động container MySQL
- Build image Docker cho ứng dụng từ Dockerfile
- Chạy ứng dụng và kết nối với MySQL

### 3. Kiểm tra ứng dụng
Sau khi khởi động, bạn có thể truy cập ứng dụng tại:
- Web: http://localhost:8080
- MySQL: localhost:3306

### 4. Dừng ứng dụng
```bash
docker-compose down
```

Để xóa cả volume data:
```bash
docker-compose down -v
```

## Các lệnh Docker hữu ích

### Xem logs của ứng dụng
```bash
docker-compose logs -f app
```

### Xem logs của MySQL
```bash
docker-compose logs -f db
```

### Khởi động lại ứng dụng
```bash
docker-compose restart app
```

### Truy cập terminal của container ứng dụng
```bash
docker-compose exec app sh
```

### Truy cập MySQL từ terminal
```bash
docker-compose exec db mysql -upmls_user -ppmls_password pmls_db
```

## Môi trường phát triển

Để phát triển ứng dụng, bạn có thể chỉ chạy MySQL trong Docker:

```bash
docker-compose up -d db
```

Sau đó chạy ứng dụng Spring Boot từ IDE của bạn, với các cấu hình kết nối MySQL phù hợp. 