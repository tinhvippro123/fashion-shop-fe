# Fashion Shop Unified Frontend (`fashion-fe`)

Đồ án môn học **Phát triển phần mềm hướng đối tượng (OOP)** — **Website Quản lý Bán Quần áo (LUXE Fashion)**.

Repository này hợp nhất **Storefront (Giao diện Khách hàng)** và **Admin Portal (Giao diện Quản trị viên)** vào chung một ứng dụng **Next.js 16 (App Router)**, kết nối 100% tới RESTful API của repository `fashion-be` (`http://localhost:8080/api`) và **không sử dụng bất kỳ mock data nào**.

---

## Kiến trúc Route Groups

- **`src/app/(storefront)/...`** (`http://localhost:3000/`):
  - Giữ nguyên 100% giao diện LUXE Fashion Storefront (`Montserrat`, header mega-menu, giỏ hàng mini, bộ lọc danh mục, chi tiết biến thể màu sắc/kích thước, đặt hàng áp mã Voucher, tra cứu & theo dõi tiến trình đơn hàng, quản lý hồ sơ, sổ địa chỉ, sản phẩm yêu thích, đánh giá sản phẩm).
- **`src/app/(admin)/admin/...`** (`http://localhost:3000/admin`):
  - Giữ nguyên 100% giao diện Admin Dashboard (`Geist` + Shadcn UI `@base-ui/react`, Dark/Light mode):
    - `/admin/login`: Đăng nhập quản trị viên
    - `/admin/dashboard`: Tổng quan doanh thu, lợi nhuận gộp, vốn nhập kho, biểu đồ doanh thu & top sản phẩm bán chạy
    - `/admin/orders` & `/admin/orders/[id]`: Duyệt đơn, bàn giao vận chuyển, hoàn thành hoặc hủy đơn (tự động hoàn kho)
    - `/admin/products`, `/admin/products/create`, `/admin/products/[id]/edit`: Quản lý sản phẩm & trình sinh biến thể SKU
    - `/admin/stock-imports`: **Quản lý Nhập kho (`StockImport` / `StockImportItem`)** — lập phiếu nhập hàng từ nhà cung cấp, tự động cộng tồn kho và tính lại giá vốn bình quân gia quyền
    - `/admin/categories`: Quản lý cây danh mục cha - con
    - `/admin/vouchers`: Quản lý mã giảm giá (`PERCENTAGE` / `FIXED_AMOUNT`)
    - `/admin/customers` & `/admin/customers/[id]`: Quản lý hồ sơ, lịch sử mua hàng, khóa/mở khóa tài khoản
    - `/admin/reviews` & `/admin/reviews/[id]`: Kiểm duyệt hiển thị & phản hồi công khai đánh giá

---

## Tài khoản Demo (Tự động khởi tạo bởi `fashion-be`)

| Vai trò | Email | Mật khẩu | Đường dẫn đăng nhập |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@luxe.vn` | `admin123` | `http://localhost:3000/admin/login` |
| **Khách hàng (Customer)** | `khachhang@gmail.com` | `123456` | `http://localhost:3000/login` |

---

## Hướng dẫn Chạy Dự án

1. **Khởi động Backend (`fashion-be`) trước** tại cổng `8080`:
   ```bash
   cd ../fashion-be
   ./gradlew bootRun
   ```

2. **Cài đặt thư viện và chạy `fashion-fe`** tại cổng `3000`:
   ```bash
   npm install
   npm run dev
   ```
   *(Mặc định kết nối tới `http://localhost:8080/api`, có thể tùy chỉnh qua biến môi trường `NEXT_PUBLIC_API_URL`).*

3. **Kiểm tra Build Production**:
   ```bash
   npm run build
   npm run start
   ```

