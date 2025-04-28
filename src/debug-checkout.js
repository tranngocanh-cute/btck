'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');

// Hàm kiểm tra cấu hình email
async function testEmailConfig() {
    console.log('===== BẮT ĐẦU KIỂM TRA CẤU HÌNH EMAIL =====');
    
    // Hiển thị thông tin cấu hình từ biến môi trường
    console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Đã cấu hình' : 'Chưa cấu hình');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
    
    try {
        // Tạo transporter test
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            debug: true // Bật chế độ debug
        });
        
        // Kiểm tra kết nối
        console.log('Đang kiểm tra kết nối...');
        const verifyResult = await transporter.verify();
        console.log('Kết quả kiểm tra kết nối:', verifyResult);
        
        // Gửi email test
        console.log('Đang gửi email test...');
        const info = await transporter.sendMail({
            from: `"Debug Test" <${process.env.EMAIL_USERNAME}>`,
            to: process.env.EMAIL_USERNAME, // Gửi cho chính mình
            subject: "Email Test từ Debug Checkout",
            text: "Đây là email test để kiểm tra cấu hình",
            html: "<b>Đây là email test để kiểm tra cấu hình</b>",
        });
        
        console.log('Email đã gửi:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        console.log('===== KIỂM TRA THÀNH CÔNG =====');
        
    } catch (error) {
        console.error('===== LỖI KIỂM TRA EMAIL =====');
        console.error('Chi tiết lỗi:', error);
        console.log('Stack trace:', error.stack);
    }
}

// Chạy hàm test
testEmailConfig().catch(console.error); 