'use strict'

const nodemailer = require('nodemailer')

const sendEmail = async ({ to, subject, html }) => {
    try {
        // Sử dụng SMTP của Gmail hoặc bạn có thể sử dụng dịch vụ SMTP khác
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true' ? true : false,
            auth: {
                user: process.env.EMAIL_USERNAME, // Email của bạn
                pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng 
            },
        })

        // Thử gửi email
        const result = await transporter.sendMail({
            from: `"Cửa hàng của bạn" <${process.env.EMAIL_USERNAME}>`,
            to: to, // Email người nhận
            subject: subject,
            html: html,
        })

        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Send email error:', error)
        return { success: false, error: error.message }
    }
}

// Template email cho đơn hàng đã thanh toán
const generateOrderConfirmationEmail = ({ customerName, orderItems, totalAmount, shippingInfo }) => {
    let itemsHtml = ''
    
    orderItems.forEach(item => {
        itemsHtml += `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.price.toLocaleString('vi-VN')} VNĐ</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
            </tr>
        `
    })

    // Tạo html cho thông tin giao hàng
    const shippingDetails = shippingInfo ? `
        <h3>Thông tin giao hàng</h3>
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="padding: 5px; width: 150px;"><strong>Người nhận:</strong></td>
                <td style="padding: 5px;">${shippingInfo.name || ''}</td>
            </tr>
            ${shippingInfo.phone ? `
            <tr>
                <td style="padding: 5px;"><strong>Số điện thoại:</strong></td>
                <td style="padding: 5px;">${shippingInfo.phone}</td>
            </tr>
            ` : ''}
            ${shippingInfo.address ? `
            <tr>
                <td style="padding: 5px;"><strong>Địa chỉ:</strong></td>
                <td style="padding: 5px;">${shippingInfo.address}</td>
            </tr>
            ` : ''}
            ${shippingInfo.city ? `
            <tr>
                <td style="padding: 5px;"><strong>Thành phố:</strong></td>
                <td style="padding: 5px;">${shippingInfo.city}</td>
            </tr>
            ` : ''}
            ${shippingInfo.zipCode ? `
            <tr>
                <td style="padding: 5px;"><strong>Mã bưu điện:</strong></td>
                <td style="padding: 5px;">${shippingInfo.zipCode}</td>
            </tr>
            ` : ''}
            ${shippingInfo.note ? `
            <tr>
                <td style="padding: 5px;"><strong>Ghi chú:</strong></td>
                <td style="padding: 5px;">${shippingInfo.note}</td>
            </tr>
            ` : ''}
        </table>
    ` : '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { width: 100%; max-width: 600px; margin: 0 auto; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f8f9fa; padding: 10px; text-align: left; }
            .total { font-weight: bold; margin-top: 20px; text-align: right; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Xác nhận đơn hàng của bạn</h2>
            </div>
            
            <div class="content">
                <p>Xin chào ${customerName},</p>
                
                <p>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
                
                ${shippingDetails}
                
                <h3>Chi tiết đơn hàng</h3>
                
                <table>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                    ${itemsHtml}
                </table>
                
                <p class="total">Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                
                <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại.</p>
                
                <p>Trân trọng,<br>Đội ngũ cửa hàng</p>
            </div>
            
            <div class="footer">
                <p>© 2023 Cửa hàng của bạn. Tất cả các quyền được bảo lưu.</p>
            </div>
        </div>
    </body>
    </html>
    `
}

module.exports = {
    sendEmail,
    generateOrderConfirmationEmail
} 