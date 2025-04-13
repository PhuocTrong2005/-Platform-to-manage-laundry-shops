@echo off
REM Script tạo file ZIP để triển khai trên máy khác

echo === Tạo package để triển khai trên máy khác ===

REM Kiểm tra đã có 7-Zip chưa
7z >nul 2>&1
if %errorlevel% neq 0 (
    echo Cảnh báo: Không tìm thấy 7-Zip trong PATH. 
    echo Sẽ sử dụng PowerShell để tạo file ZIP.
    set USE_POWERSHELL=1
) else (
    set USE_POWERSHELL=0
)

REM Chuyển đến thư mục gốc của dự án
cd /d %~dp0\..

REM Tên file zip
set ZIP_NAME=pmls-docker-package-%date:~-4,4%%date:~-7,2%%date:~-10,2%.zip
echo Tạo file: %ZIP_NAME%

REM Danh sách các file cần đóng gói
set FILES_TO_INCLUDE=Dockerfile docker-compose.yml .env .dockerignore pom.xml build-and-deploy.bat README.md

REM Kiểm tra xem đã build ứng dụng chưa
if not exist target\*.jar (
    echo Cảnh báo: Không tìm thấy file JAR trong thư mục target.
    set /p BUILD_NOW=Bạn có muốn build ứng dụng ngay bây giờ không? (y/n): 
    
    if /i "%BUILD_NOW%"=="y" (
        echo Building ứng dụng...
        call mvn clean package -DskipTests
        if %errorlevel% neq 0 (
            echo Lỗi: Không thể build ứng dụng.
            exit /b 1
        )
    ) else (
        echo Lưu ý: Package không bao gồm file JAR.
        echo Người dùng sẽ cần tự build ứng dụng trên máy khác.
    )
)

REM Tạo thư mục tạm thời
set TEMP_DIR=temp-package
if exist %TEMP_DIR% rmdir /s /q %TEMP_DIR%
mkdir %TEMP_DIR%
mkdir %TEMP_DIR%\scripts
mkdir %TEMP_DIR%\src

REM Sao chép các file cần thiết
echo Đang sao chép các file...
for %%F in (%FILES_TO_INCLUDE%) do (
    if exist %%F copy %%F %TEMP_DIR%\
)

REM Sao chép thư mục scripts
copy scripts\*.bat %TEMP_DIR%\scripts\

REM Sao chép thư mục mã nguồn chính
xcopy /E /I src\main\resources %TEMP_DIR%\src\main\resources
xcopy /E /I src\main\java %TEMP_DIR%\src\main\java

REM Sao chép file JAR nếu có
if exist target\*.jar (
    mkdir %TEMP_DIR%\target
    copy target\*.jar %TEMP_DIR%\target\
    echo File JAR đã được bao gồm trong package.
) else (
    echo File JAR không được bao gồm trong package.
)

REM Tạo file ZIP
if %USE_POWERSHELL%==1 (
    echo Đang tạo file ZIP bằng PowerShell...
    powershell -command "Compress-Archive -Path %TEMP_DIR%\* -DestinationPath %ZIP_NAME% -Force"
) else (
    echo Đang tạo file ZIP bằng 7-Zip...
    7z a -tzip %ZIP_NAME% %TEMP_DIR%\*
)

REM Xóa thư mục tạm thời
rmdir /s /q %TEMP_DIR%

echo.
echo === Hoàn tất ===
echo Package đã được tạo: %ZIP_NAME%
echo.
echo Package này bao gồm tất cả các file cần thiết để triển khai ứng dụng trên máy khác.
echo Để triển khai, chỉ cần giải nén file và chạy build-and-deploy.bat

pause 