📘 HRM APP – Human Resource Management App
Ứng dụng quản lý nhân sự cơ bản với các chức năng thêm, sửa, xóa và lọc nhân viên bằng dropdown. Giao diện người dùng được xây dựng bằng Next.js, dữ liệu được quản lý thông qua JSON Server.

🛠️ Cài đặt & Chạy dự án
1. Clone repo
cd hrm-app
2. Cài đặt các gói cần thiết
npm install
3. Khởi động dự án
npm run dev
Mở trình duyệt và truy cập: http://localhost:3000

🚀 Tính năng chính
✅ Quản lý nhân viên tại /admin/employee

Thêm, sửa, xóa thông tin nhân viên

Tìm kiếm nhân viên theo tên

Lọc theo chi nhánh hoặc chức vụ

✅ Quản lý hợp đồng tại /admin/constrast

Thêm hợp đồng mới nếu nhân viên chưa có hợp đồng

Cập nhật hợp đồng nếu nhân viên đã có hợp đồng

✅ Xem bảng lương tại /admin/salary

Hiển thị danh sách lương của toàn bộ nhân viên

🧑‍💼 Hướng dẫn sử dụng
1. Trang quản lý nhân viên
🔗 Truy cập: http://localhost:3000/admin/employee

Nhấn "Thêm nhân viên" để thêm mới

Nhấn "Sửa" hoặc "Xóa" tại từng dòng để chỉnh sửa hoặc xóa nhân viên

Sử dụng ô tìm kiếm để lọc theo tên nhân viên

Dùng các dropdown để lọc theo chi nhánh hoặc chức vụ

2. Trang quản lý hợp đồng
🔗 Truy cập: http://localhost:3000/admin/constrast

Danh sách nhân viên sẽ hiển thị kèm thông tin hợp đồng (nếu có)

Với nhân viên chưa có hợp đồng, nhấn "Thêm hợp đồng"

Với nhân viên đã có hợp đồng, nhấn "Cập nhật" để chỉnh sửa

3. Trang hiển thị bảng lương
🔗 Truy cập: http://localhost:3000/admin/salary

Hiển thị danh sách các nhân viên và thông tin lương tương ứng

Dữ liệu được đồng bộ từ hệ thống nhân viên và hợp đồng