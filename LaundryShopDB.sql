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
    PaymentMethod NVARCHAR(50) CHECK (PaymentMethod IN ('Ngân hàng', 'Momo', 'Tiền mặt')) NOT NULL,
    PaymentStatus NVARCHAR(50) CHECK (PaymentStatus IN ('Đã nhận', 'Hoàn thành', 'Đã giao')) DEFAULT 'Đã nhận',
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


INSERT INTO Users (FullName, Email, Phone, PasswordHash, Role) VALUES
('Huynh Phuoc Trong', 'tronghp@gmail.com', '0901234567', 'sh1', 'ShopOwner'),
('Nguyen Minh Man','minhmann@gmail.com', '0847572638', 'sh2','ShopOwner'),
('Nguyen Thanh Vuong', 'vuongnt@gmail.com', '0902345678', 'cus1', 'Customer'),
('Tran Thanh Tai', 'taitt@gmail.com', '0947575948', 'cus2', 'Customer'),
('Nguyen Hoang Tuan', 'hoangtuan@gmail.com', '0938764647','cus3', 'Customer'),
('Tran Thuy Vi', 'vitt@gmail.com', '099999375', 'st1', 'Staff'),
('Nguyen Tan Tu', 'tung@gmail.com', '0938474773', 'st2', 'Staff'),
('Tran Gia Huy', 'giahuy@gmail.com', '0875837494', 'st3', 'Staff'),
('Do Trung Lap', 'trunglapd@gmail.com', '0383648377', 'st4', 'Staff');

INSERT INTO Shops (OwnerID, ShopName, Location, ServicesOffered, OperatingHours) VALUES
(1, 'Giặt Ủi Xanh', '222 Đường 27, Quận 3', 'Giặt, Sấy, Ủi', '8:00 - 20:00'),
(1, 'Giặt Ủi Nhanh', '456 Đường Nguyễn Trãi, Quận 5', 'Giặt, Sấy, Ủi', '7:30 - 21:00'),
(2, 'Giặt Ủi Siêu Sạch', '789 Đường Lý Thường Kiệt, Quận 10', 'Giặt, Sấy, Ủi', '8:00 - 19:00');


INSERT INTO Staff (UserID, ShopID, Role) VALUES
(6, 1, 'Nhân viên'),
(6, 1, 'Nhân viên'),
(7, 2, 'Nhân viên'),
(7, 2, 'Nhân viên'),
(8, 3, 'Nhân viên'),
(8, 3, 'Nhân viên'),
(9, 3, 'Nhân viên');

INSERT INTO Services (ShopID, ServiceName, Price) VALUES
(1, 'Giặt thường', 50000),
(1, 'Sấy khô', 30000),
(1, 'Ủi quần áo', 20000),
(2, 'Giặt hấp', 70000),
(2, 'Ủi chuyên nghiệp', 60000),
(3, 'Ủi quần áo', 20000),
(3, 'Giặt hấp', 70000),
(3, 'Sấy khô', 30000);

INSERT INTO Orders (CustomerID, ShopID, Status, TotalAmount) VALUES
(3, 1, 'Hoàn thành', 100000),
(4, 2, 'Đã nhận', 130000),
(5, 3, 'Đã giao', 100000);

INSERT INTO OrderDetails (OrderID, ServiceID, Quantity, SubTotal) VALUES
(1, 1, 1, 50000),
(1, 2, 1, 30000),
(1, 3, 1, 20000),
(2, 4, 1, 70000),
(2, 5, 1, 60000), 
(3, 7, 1, 70000),
(3, 8, 1, 80000);

INSERT INTO Payments (OrderID, Amount, PaymentMethod, PaymentStatus) VALUES
(1, 100000, 'Ngân hàng', 'Completed'),
(2, 130000, 'Momo', 'Completed'),
(3, 100000, 'Tiền mặt', 'Completed');

INSERT INTO Reviews (CustomerID, ShopID, Rating, Comment) VALUES
(3, 1, 5, 'Dịch vụ tốt, giặt sạch!'),
(4, 2, 5, 'Rất sạch và thơm.'),
(5, 3, 4, 'Nhanh chóng và tiện lợi');

