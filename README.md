# Hướng dẫn cấu hình Email

Để sử dụng tính năng gửi email xác nhận đơn hàng, bạn cần cấu hình email trong file `.env`:

```env
# Email configuration
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Cách tạo mật khẩu ứng dụng cho Gmail:

1. Đăng nhập vào tài khoản Google của bạn
2. Vào "Quản lý tài khoản Google" > "Bảo mật"
3. Trong phần "Đăng nhập vào Google", bật xác minh 2 bước nếu chưa bật
4. Sau đó, tìm "Mật khẩu ứng dụng" và tạo một mật khẩu mới
5. Sử dụng mật khẩu đó cho `EMAIL_PASSWORD` trong file `.env` 

# Hướng dẫn sử dụng API Checkout

API Checkout cho phép thanh toán một phần hoặc toàn bộ giỏ hàng của người dùng. Bạn có thể chỉ định sản phẩm cần thanh toán và cung cấp thông tin liên hệ, địa chỉ giao hàng.

## URL
```
POST http://localhost:3055/v1/api/cart/checkout
```

## Headers
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

## Body
```json
{
  "productIds": ["65f8d7a9e95a3c3b4c8d1234", "65f8d7a9e95a3c3b4c8d5678"],
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0912345678",
  "address": "123 Đường ABC, Phường XYZ",
  "city": "Hà Nội",
  "zipCode": "100000",
  "note": "Giao hàng giờ hành chính"
}
```

### Các trường trong Body Request

- `productIds` (tùy chọn): Mảng các ID sản phẩm cần thanh toán từ giỏ hàng
  - Nếu không cung cấp trường này, tất cả sản phẩm trong giỏ hàng sẽ được thanh toán
  - Nếu cung cấp, chỉ những sản phẩm có ID trong danh sách sẽ được thanh toán

- Thông tin giao hàng (tất cả đều tùy chọn):
  - `name`: Tên người nhận hàng
  - `email`: Email người nhận hàng (để gửi xác nhận đơn hàng)
  - `phone`: Số điện thoại liên hệ
  - `address`: Địa chỉ giao hàng
  - `city`: Thành phố/Tỉnh
  - `zipCode`: Mã bưu điện
  - `note`: Ghi chú cho đơn hàng

*Lưu ý: Nếu không cung cấp các thông tin này, hệ thống sẽ sử dụng thông tin từ tài khoản người dùng (nếu có).*

## Kết quả trả về
```json
{
  "message": "Checkout completed successfully",
  "metadata": {
    "success": true,
    "message": "Checkout completed successfully",
    "orderInfo": {
      "totalAmount": 1000000,
      "itemCount": 2,
      "shippingInfo": {
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0912345678",
        "address": "123 Đường ABC, Phường XYZ",
        "city": "Hà Nội",
        "zipCode": "100000",
        "note": "Giao hàng giờ hành chính"
      }
    },
    "emailSent": true
  }
}
```

## Lưu ý
- API này yêu cầu người dùng đã đăng nhập và có token xác thực
- Các sản phẩm phải có sẵn trong giỏ hàng trước khi thanh toán
- Sản phẩm sẽ bị xóa khỏi giỏ hàng sau khi thanh toán thành công
- Người dùng sẽ nhận được email xác nhận nếu đã cung cấp email 

# Cập nhật API Search và Tìm kiếm Sản phẩm

Các API tìm kiếm sản phẩm (`searchProducts`, `findAllProducts`, `findOneProducts`) đã được cập nhật để trả về thêm trường `stock_status` cho mỗi sản phẩm. Trường này cho biết tình trạng tồn kho hiện tại của sản phẩm.

### Trường `stock_status` có thể có các giá trị sau:

- `in_stock`: Sản phẩm còn hàng.
- `out_of_stock`: Sản phẩm đã hết hàng.
- `low_stock` (Tùy chọn, hiện đang comment): Sản phẩm sắp hết hàng (ví dụ: < 10 sản phẩm). Bạn có thể bỏ comment trong code `product.repo.js` nếu muốn sử dụng trạng thái này.

### Ví dụ Response của API `searchProducts`:

```json
[
  {
    "_id": "680a6b12784757cdffef92a7",
    "product_name": "Điện thoại iphone",
    "product_thumb": "https://...",
    "product_images": [],
    "product_description": "Mô tả sản phẩm",
    "product_price": 50000,
    "product_quantity": 0, // Số lượng tổng của sản phẩm (không phải số lượng tồn kho)
    "product_type": "iPhone",
    "product_shop": "680a6a54784757cdffef928e",
    "product_attributes": { ... },
    "isDraft": false,
    "isPublished": true,
    "createdAt": "...",
    "updatedAt": "...",
    "stock_status": "out_of_stock" // <--- Trường mới
  },
  {
    "_id": "...";
    "product_name": "Sản phẩm khác",
    ...
    "stock_status": "in_stock"
  }
]
```

### Lưu ý:

- Trường `product_quantity` trong kết quả trả về là tổng số lượng sản phẩm được tạo ban đầu, **không phải** số lượng tồn kho hiện tại.
- Sử dụng trường `stock_status` để hiển thị cho người dùng biết sản phẩm còn hàng hay đã hết. 

# Thêm trường `product_hot` khi tạo/cập nhật sản phẩm

Khi tạo hoặc cập nhật sản phẩm (API `/product/create` và `/product/update/:productId`), bạn có thể truyền thêm trường `product_hot`:

```json
{
  "product_name": "Sản phẩm Mới",
  "product_thumb": "link-anh-thumb.jpg",
  "product_description": "Mô tả chi tiết",
  "product_price": 150000,
  "product_quantity": 50,
  "product_type": "Electronics",
  "product_attributes": { ... },
  "product_images": ["link1.jpg", "link2.jpg"],
  "product_hot": true // <-- Thêm trường này (true hoặc false)
}
```

- Nếu không truyền, `product_hot` mặc định là `false`.

# API Lấy Danh Sách Sản Phẩm Hot

API này trả về danh sách các sản phẩm được đánh dấu là hot (`product_hot: true`) và đã được publish.

## URL
```
GET http://localhost:3055/v1/api/product/hot
```

## Query Parameters (Tùy chọn)

- `limit` (Number): Số lượng sản phẩm trên mỗi trang (mặc định: 10).
- `page` (Number): Trang hiện tại (mặc định: 1).

Ví dụ: `http://localhost:3055/v1/api/product/hot?limit=20&page=2`

## Headers

Không yêu cầu header đặc biệt (API công khai).

## Kết quả trả về

Trả về một mảng các sản phẩm hot, mỗi sản phẩm có cấu trúc tương tự như trong API search, bao gồm cả trường `stock_status`.

```json
[
  {
    "_id": "...",
    "product_name": "Sản phẩm Hot 1",
    "product_thumb": "...",
    "product_images": [],
    "product_price": 200000,
    "product_type": "Clothing",
    "product_shop": "...",
    "stock_status": "in_stock"
  },
  {
    "_id": "...",
    "product_name": "Sản phẩm Hot 2",
    ...
    "stock_status": "out_of_stock"
  }
]
``` 