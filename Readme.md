# Chức năng bổ sung

## Wallet Management

Hệ thống hỗ trợ người dùng quản lý nhiều ví tài chính khác nhau để theo dõi nguồn tiền riêng biệt.

### Chức năng

* Tạo ví mới
* Cập nhật thông tin ví
* Xóa ví
* Xem danh sách ví
* Xem số dư hiện tại
* Theo dõi lịch sử biến động số dư

### Loại ví hỗ trợ

* Cash Wallet
* Bank Account
* E-Wallet

### Wallet Entity

| Field          | Type       | Description    |
| -------------- | ---------- | -------------- |
| id             | UUID       | Wallet ID      |
| name           | String     | Tên ví         |
| type           | WalletType | Loại ví        |
| initialBalance | BigDecimal | Số dư ban đầu  |
| currentBalance | BigDecimal | Số dư hiện tại |
| userId         | UUID       | Chủ sở hữu     |

### API

```http
GET    /api/wallets
GET    /api/wallets/{id}
POST   /api/wallets
PUT    /api/wallets/{id}
DELETE /api/wallets/{id}
```

---

# Transfer Module

Cho phép chuyển tiền giữa các ví của cùng một người dùng.

### Chức năng

* Chuyển tiền giữa các ví
* Kiểm tra số dư trước khi chuyển
* Cập nhật đồng thời số dư ví nguồn và ví đích
* Đảm bảo dữ liệu bằng Transaction

### Business Rule

* Không được chuyển khi số dư không đủ.
* Tổng tài sản của người dùng không thay đổi sau khi chuyển.
* Toàn bộ thao tác được thực hiện trong một Transaction.

### API

```http
POST /api/transfers
```

---

# Report & Statistics

Hệ thống cung cấp các API phục vụ Dashboard.

### Dashboard

* Tổng thu nhập
* Tổng chi tiêu
* Tổng tài sản
* Số dư hiện tại

### Báo cáo

* Theo ngày
* Theo tuần
* Theo tháng
* Theo năm

### Thống kê

* Thu nhập theo thời gian
* Chi tiêu theo thời gian
* Chi tiêu theo danh mục
* Tỷ lệ thu chi

### API

```http
GET /api/reports/summary
GET /api/reports/monthly
GET /api/reports/yearly
GET /api/reports/category
GET /api/reports/trend
```

---

# Refresh Token

Ngoài JWT Access Token, hệ thống sử dụng Refresh Token nhằm tăng cường bảo mật và giảm số lần đăng nhập.

### Chức năng

* Sinh Refresh Token khi đăng nhập.
* Lưu Refresh Token trong cơ sở dữ liệu.
* Gia hạn Access Token khi hết hạn.
* Thu hồi Refresh Token khi đăng xuất.

### API

```http
POST /api/auth/refresh-token
POST /api/auth/logout
```

---

# Role-Based Access Control (RBAC)

Hệ thống áp dụng cơ chế phân quyền dựa trên vai trò.

## USER

Có quyền:

* Quản lý thông tin cá nhân.
* Quản lý ví.
* Quản lý giao dịch.
* Quản lý ngân sách.
* Xem thống kê tài chính của bản thân.

## ADMIN

Có quyền:

* Quản lý người dùng.
* Quản lý hệ thống.
* Theo dõi thống kê tổng hợp.

---

# Database Migration

Hệ thống sử dụng Flyway để quản lý phiên bản cơ sở dữ liệu.

### Migration Structure

```text
db/
└── migration
    ├── V1__create_users.sql
    ├── V2__create_wallets.sql
    ├── V3__create_categories.sql
    ├── V4__create_transactions.sql
    ├── V5__create_budgets.sql
    ├── V6__create_refresh_tokens.sql
```

---

# Business Rules

## BR01

Số tiền giao dịch phải lớn hơn 0.

## BR02

Không cho phép chi tiêu hoặc chuyển khoản khi số dư ví không đủ.

## BR03

Khi tổng chi tiêu trong tháng vượt ngân sách đã thiết lập, hệ thống sinh cảnh báo.

## BR04

Chuyển khoản giữa hai ví phải đảm bảo tính toàn vẹn dữ liệu (Atomic Transaction).

## BR05

Người dùng chỉ được phép truy cập dữ liệu thuộc quyền sở hữu của mình.

---

# Testing

Các trường hợp kiểm thử chính:

* Đăng ký tài khoản.
* Đăng nhập bằng JWT.
* Tạo ví mới.
* Ghi nhận giao dịch thu nhập.
* Ghi nhận giao dịch chi tiêu.
* Chuyển khoản giữa hai ví.
* Từ chối giao dịch khi số dư không đủ.
* Cảnh báo vượt ngân sách.
* Refresh Access Token.
* Kiểm tra phân quyền người dùng.

---

# Future Development

* Giao dịch định kỳ (Recurring Transactions).
* Đồng bộ tài khoản ngân hàng.
* Thông báo Email.
* Thông báo Realtime.
* Xuất báo cáo PDF/Excel.
* Ứng dụng Mobile.
* AI phân tích và dự đoán chi tiêu.
