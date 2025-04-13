@echo off
REM Script chính để build và triển khai ứng dụng PMLS

echo ===== Phú Mỹ Laundry Service - Build & Deploy =====
echo.

REM Hiển thị menu cho người dùng chọn
echo Chọn chức năng:
echo 1. Build và triển khai với Docker
echo 2. Chỉ build ứng dụng
echo 3. Chỉ triển khai với Docker (sử dụng build hiện có)
echo 4. Dừng tất cả các container
echo 5. Xóa tất cả container và dữ liệu
echo 6. Thoát
echo.

set /p CHOICE=Nhập lựa chọn của bạn (1-6): 

if "%CHOICE%"=="1" (
    echo === Build và triển khai với Docker ===
    call scripts\docker-deploy.bat
) else if "%CHOICE%"=="2" (
    echo === Chỉ build ứng dụng ===
    call mvn clean package -DskipTests
    echo.
    echo Build hoàn tất. File JAR của ứng dụng được lưu tại thư mục target.
    pause
) else if "%CHOICE%"=="3" (
    echo === Chỉ triển khai với Docker (sử dụng build hiện có) ===
    REM Kiểm tra xem file JAR đã tồn tại chưa
    if not exist target\*.jar (
        echo Lỗi: Không tìm thấy file JAR trong thư mục target.
        echo Vui lòng build ứng dụng trước khi triển khai.
        pause
        exit /b 1
    )
    
    REM Triển khai với Docker Compose
    docker-compose up -d --build
    echo.
    echo Triển khai hoàn tất. Truy cập ứng dụng tại: http://localhost:8080
    pause
) else if "%CHOICE%"=="4" (
    echo === Dừng tất cả các container ===
    docker-compose down
    echo.
    echo Tất cả các container đã được dừng.
    pause
) else if "%CHOICE%"=="5" (
    echo === Xóa tất cả container và dữ liệu ===
    echo CẢNH BÁO: Thao tác này sẽ xóa TẤT CẢ dữ liệu của ứng dụng!
    set /p CONFIRM=Bạn có chắc chắn muốn tiếp tục? (y/n): 
    
    if /i "%CONFIRM%"=="y" (
        docker-compose down -v
        if exist docker\mysql-data rmdir /s /q docker\mysql-data
        echo.
        echo Tất cả container và dữ liệu đã được xóa.
    ) else (
        echo.
        echo Thao tác đã được hủy.
    )
    pause
) else if "%CHOICE%"=="6" (
    echo Thoát chương trình.
    exit /b 0
) else (
    echo Lựa chọn không hợp lệ. Vui lòng chọn từ 1 đến 6.
    pause
    exit /b 1
)

exit /b 0 