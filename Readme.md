# Personal Finance Management System 💰

Hệ thống Quản lý Tài chính Cá nhân giúp người dùng theo dõi thu nhập, chi tiêu, lập ngân sách và phân tích xu hướng tài chính một cách trực quan, hiện đại và an toàn.

## 🌟 Tính năng nổi bật

### Dành cho Người dùng (User)
* **Quản lý Ví (Wallets)**: Hỗ trợ nhiều ví (ví tiền mặt, thẻ tín dụng, ngân hàng). Hỗ trợ tính năng chuyển khoản giữa các ví (Transfer).
* **Quản lý Danh mục (Categories)**: Tùy chỉnh danh mục thu/chi (Income/Expense) với biểu tượng Emoji trực quan.
* **Quản lý Giao dịch (Transactions)**: Ghi nhận thu/chi hàng ngày. Bộ lọc mạnh mẽ theo ví, danh mục và khoảng thời gian.
* **Ngân sách (Budgets)**: Lập giới hạn chi tiêu hàng tháng cho từng danh mục. Tự động cảnh báo khi giao dịch mới vượt quá ngân sách.
* **Báo cáo & Phân tích (Reports)**: Trực quan hóa dữ liệu bằng biểu đồ (Line chart cho dòng tiền Cashflow, Pie chart cho phân bổ chi tiêu) sử dụng Recharts.
* **Bảo mật**: Xác thực và phân quyền bằng JWT.

### Dành cho Quản trị viên (Admin)
* **Quản lý Người dùng**: Xem danh sách toàn bộ người dùng trên hệ thống, số lượng tài khoản đăng ký mới. Có quyền xóa tài khoản vi phạm.
* **Chế độ xem hộ (Impersonation Mode)**: Hỗ trợ Admin xem trực tiếp dữ liệu (Dashboard, Giao dịch, Ví...) dưới góc nhìn của bất kỳ người dùng nào thông qua header `X-Impersonate-User`. Ở chế độ này, Admin bị giới hạn **chỉ xem (Read-only)**, tuyệt đối không thể Thêm/Sửa/Xóa dữ liệu của người dùng, đảm bảo tính nguyên vẹn dữ liệu.

---

## 🛠 Công nghệ sử dụng

### Backend
* **Khung ứng dụng**: Java Spring Boot 3
* **Bảo mật**: Spring Security & JWT (JSON Web Tokens)
* **Cơ sở dữ liệu**: MySQL (kết nối qua Spring Data JPA / Hibernate)
* **API Documentation**: OpenAPI 3 (Swagger UI)
* **CORS & Filters**: Tích hợp các Filter xử lý phân quyền và Header động cho chế độ Impersonation.

### Frontend
* **Khung ứng dụng**: React (Vite) + TypeScript
* **Styling**: Tailwind CSS & Lucide React Icons
* **Quản lý State & API**: TanStack React Query (quản lý data caching & đồng bộ)
* **Routing**: React Router DOM
* **Forms**: React Hook Form
* **Biểu đồ**: Recharts

---

## 🚀 Hướng dẫn cài đặt

### 1. Cài đặt Backend
1. Đảm bảo bạn đã cài đặt Java 17+ và MySQL.
2. Tạo database trong MySQL:
   ```sql
   CREATE DATABASE finance_db;
   ```
3. Cấu hình thông tin database trong `src/main/resources/application.properties` (username/password).
4. Mở terminal, chạy lệnh để build và khởi động:
   ```bash
   ./mvnw clean spring-boot:run
   ```
5. Truy cập API Documentation (Swagger) tại: `http://localhost:8080/swagger-ui/index.html`

### 2. Cài đặt Frontend
1. Đảm bảo bạn đã cài đặt Node.js (v18+).
2. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
3. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
4. Khởi động môi trường phát triển:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 🏗 Kiến trúc Cơ sở dữ liệu (Database Schema)

* **Users**: `id`, `email`, `password`, `full_name`, `role`, `created_at`
* **Wallets**: `id`, `name`, `type`, `balance`, `user_id`
* **Categories**: `id`, `name`, `type` (INCOME/EXPENSE), `icon`, `user_id`
* **Transactions**: `id`, `amount`, `type`, `date`, `note`, `wallet_id`, `category_id`, `user_id`
* **Budgets**: `id`, `month`, `year`, `limit_amount`, `category_id`, `user_id`

*(Số tiền đã chi tiêu của Budget được tính toán động từ tổng các Transaction thuộc danh mục đó trong tháng, đảm bảo dữ liệu luôn chính xác 100% theo thời gian thực).*

---

## 👤 Chế độ Admin Impersonation (Kỹ thuật)

Khi Admin muốn xem dữ liệu của User `A`:
1. Frontend sẽ gắn email của `A` vào header HTTP: `X-Impersonate-User: A@gmail.com`.
2. `JwtAuthenticationFilter` của Spring Security sẽ bắt được header này.
3. Nếu Token JWT hợp lệ và thuộc về `ROLE_ADMIN`, Backend sẽ tạm thời chuyển ngữ cảnh (Security Context) sang `A`.
4. Nếu HTTP Method là `GET`, Backend trả về dữ liệu của `A`.
5. Nếu HTTP Method là `POST, PUT, DELETE`, Backend ngay lập tức chặn và ném ra lỗi `403 Forbidden` nhằm ngăn chặn Admin thay đổi dữ liệu của `A`. 
