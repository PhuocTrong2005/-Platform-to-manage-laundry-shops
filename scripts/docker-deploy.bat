@echo off
REM Script triển khai ứng dụng PMLS với Docker trên Windows

echo === Triển khai ứng dụng PMLS với Docker ===

REM Kiểm tra Docker đã được cài đặt
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Lỗi: Docker chưa được cài đặt. Vui lòng cài đặt Docker trước khi tiếp tục.
    exit /b 1
)

REM Kiểm tra Docker Compose đã được cài đặt
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Lỗi: Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước khi tiếp tục.
    exit /b 1
)

REM Chuyển đến thư mục gốc của dự án
cd /d %~dp0\..

REM Tìm JDK trên máy
javac -version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%a in ('javac -version 2^>^&1') do set JAVA_VERSION=%%a
    echo Phát hiện JDK phiên bản: %JAVA_VERSION%
) else (
    echo Cảnh báo: Không tìm thấy JDK trong PATH. Sẽ sử dụng JDK trong Docker.
)

REM Kiểm tra Maven đã được cài đặt
mvn -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('mvn -v ^| findstr /r "^Apache Maven"') do set MVN_VERSION=%%a
    echo Phát hiện Maven: %MVN_VERSION%
    
    REM Build ứng dụng với Maven
    echo === Building ứng dụng với Maven ===
    call mvn clean package -DskipTests
    if %errorlevel% neq 0 (
        echo Lỗi: Không thể build ứng dụng với Maven.
        exit /b 1
    )
) else (
    echo Cảnh báo: Maven chưa được cài đặt. Sẽ bỏ qua bước build.
    echo Đảm bảo file JAR đã tồn tại trong thư mục target.
)

REM Tạo thư mục cho dữ liệu MySQL nếu chưa tồn tại
if not exist docker\mysql-data mkdir docker\mysql-data

REM Khởi động ứng dụng với Docker Compose
echo === Khởi động các container Docker ===
docker-compose down -v >nul 2>&1
docker-compose up -d --build

REM Kiểm tra xem các container đã hoạt động chưa
echo === Kiểm tra trạng thái các container ===
docker-compose ps

echo.
echo === Triển khai hoàn tất ===
echo Ứng dụng PMLS đã được triển khai thành công!
echo Truy cập ứng dụng tại: http://localhost:8080
echo.
echo Xem logs với lệnh: docker-compose logs -f
echo Dừng ứng dụng với lệnh: docker-compose down

pause 