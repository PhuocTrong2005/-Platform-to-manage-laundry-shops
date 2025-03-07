CREATE DATABASE PMLS;
GO
USE PMLS;
GO
-- Tạo database
-- Bảng người dùng (Shop Owner, Staff, Customer)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Phone NVARCHAR(15) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) CHECK (Role IN ('ShopOwner', 'Staff', 'Customer', 'Admin')) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng cửa hàng
CREATE TABLE Shops (
    ShopID INT IDENTITY(1,1) PRIMARY KEY,
    OwnerID INT FOREIGN KEY REFERENCES Users(UserID),
    ShopName NVARCHAR(100) NOT NULL,
    Location NVARCHAR(255) NOT NULL,
    ServicesOffered NVARCHAR(MAX),
    OperatingHours NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng nhân viên
CREATE TABLE Staff (
    StaffID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    ShopID INT FOREIGN KEY REFERENCES Shops(ShopID) ON DELETE CASCADE,
    Role NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng dịch vụ
CREATE TABLE Services (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    ShopID INT FOREIGN KEY REFERENCES Shops(ShopID) ON DELETE CASCADE,
    ServiceName NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng đơn hàng
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT FOREIGN KEY REFERENCES Users(UserID),
    ShopID INT FOREIGN KEY REFERENCES Shops(ShopID),
    Status NVARCHAR(50) CHECK (Status IN ('Received', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Received',
    TotalAmount DECIMAL(10,2),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng chi tiết đơn hàng
CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    ServiceID INT FOREIGN KEY REFERENCES Services(ServiceID) ON DELETE CASCADE,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    SubTotal DECIMAL(10,2) NOT NULL
);

-- Bảng thanh toán
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID) ON DELETE CASCADE,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(50) CHECK (PaymentMethod IN ('Cash', 'Credit Card', 'E-Wallet')) NOT NULL,
    PaymentStatus NVARCHAR(50) CHECK (PaymentStatus IN ('Pending', 'Completed', 'Failed')) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng đánh giá
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    ShopID INT FOREIGN KEY REFERENCES Shops(ShopID) ON DELETE CASCADE,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);


