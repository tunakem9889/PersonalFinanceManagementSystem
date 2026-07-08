1. Giới thiệu đề tài
Đề tài xây dựng hệ thống giúp người dùng theo dõi thu nhập, chi tiêu, lập ngân sách theo danh mục và phân tích xu hướng tài chính cá nhân theo thời gian. Trọng tâm là thiết kế dữ liệu cho giao dịch, danh mục, ngân sách và báo cáo tổng hợp.
2. Mục tiêu đào tạo
•	Thiết kế được mô hình dữ liệu cho transaction, category, budget, wallet và report.
•	Xây dựng API ghi nhận giao dịch thu/chi, phân loại theo danh mục và tính số dư ví.
•	Hiện thực cơ chế cảnh báo khi chi tiêu vượt ngân sách tháng theo từng danh mục.
•	Cung cấp API thống kê và biểu đồ xu hướng tài chính theo ngày, tuần, tháng, năm.
•	Hỗ trợ nhiều ví (ví tiền mặt, ví ngân hàng) và chuyển khoản giữa ví.
3. Chuẩn đầu ra mong đợi
•	Thiết kế được CSDL cho wallets, transactions, categories, budgets và reports.
•	Cài đặt API ghi giao dịch, tính số dư theo thời gian thực và báo cáo tổng hợp.
•	Viết test cho giao dịch âm số dư, vượt ngân sách và phân quyền dữ liệu cá nhân.
4. Phát biểu bài toán
Hệ thống phải cho phép người dùng tạo nhiều ví, ghi nhận từng giao dịch thu chi với danh mục và ghi chú, đặt ngân sách chi tiêu tháng theo danh mục và theo dõi tiến độ chi tiêu so với ngân sách. API thống kê phải trả về dữ liệu phân tích phục vụ trực quan hóa ở phía frontend.
5. Phần Backend 
5.1 Các nhóm API cần xây dựng
•	API quản lý ví: tạo ví, cập nhật tên/loại ví, tính số dư hiện tại và lịch sử biến động.
•	API giao dịch: CRUD giao dịch thu/chi, lọc theo ví/danh mục/khoảng thời gian.
•	API chuyển khoản giữa ví trong transaction đảm bảo cân bằng tổng số dư.
•	API ngân sách: tạo budget theo danh mục và tháng, tính phần trăm đã chi so với ngân sách.
•	API báo cáo: tổng thu, tổng chi, số dư cuối kỳ, phân bổ chi tiêu theo danh mục dạng JSON.
5.2 Thiết kế cơ sở dữ liệu
•	Bảng users lưu tài khoản người dùng.
•	Bảng wallets lưu thông tin ví, loại ví, số dư ban đầu và tổng số dư hiện tại.
•	Bảng categories lưu danh mục thu/chi, biểu tượng và loại (INCOME/EXPENSE).
•	Bảng transactions lưu giao dịch, số tiền, loại, ngày, ghi chú, wallet và category.
•	Bảng budgets lưu ngân sách theo danh mục, tháng và giá trị giới hạn.

6. Phần Frontend 
6.1 Các trang và màn hình cần xây dựng
•	Trang tìm kiếm sách – Tìm theo tiêu đề/tác giả/thể loại, xem tình trạng bản sao
•	Trang chi tiết sách – Thông tin đầy đủ, số bản sao khả dụng và nút đặt mượn/đặt chỗ
•	Trang lịch sử mượn – Danh sách phiếu mượn, hạn trả, trạng thái và tiền phạt
•	Trang tài khoản thành viên – Thông tin thẻ, sách đang mượn và đặt chỗ đang chờ
•	Thư viện viên – Quản lý kho sách, bản sao, xử lý mượn/trả và danh sách sách quá hạn
•	Admin – Quản lý thành viên, báo cáo thống kê và cấu hình phí phạt
6.2 Các component chính cần hiện thực
•	BookCard – Thẻ sách với ảnh bìa, tác giả, badge số bản sao khả dụng
•	LoanStatusBadge – Badge màu trạng thái: Active/Overdue/Returned/Reserved
•	FineCalculator – Hiển thị số ngày quá hạn và số tiền phạt tự động tính
•	BookCopyTable – Bảng quản lý bản sao theo mã, tình trạng và vị trí kệ (thư viện viên)
•	OverdueAlertList – Danh sách sách quá hạn cần xử lý, sort theo số ngày trễ
•	PopularBooksChart – Biểu đồ cột sách được mượn nhiều nhất trong tháng

