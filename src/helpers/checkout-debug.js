'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Đọc file .env thủ công
function readEnvFile() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        console.log('Đường dẫn tới file .env:', envPath);
        
        const exists = fs.existsSync(envPath);
        console.log('File .env tồn tại:', exists);
        
        if (exists) {
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            
            const envVars = {};
            
            lines.forEach(line => {
                // Bỏ qua dòng comment và dòng trống
                if (line.trim() && !line.startsWith('#')) {
                    const parts = line.split('=');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        // Nối lại các phần sau dấu = vì giá trị có thể chứa dấu =
                        const value = parts.slice(1).join('=').trim();
                        envVars[key] = value;
                    }
                }
            });
            
            console.log('Đã đọc được các biến môi trường:', Object.keys(envVars));
            return envVars;
        }
    } catch (error) {
        console.error('Lỗi khi đọc file .env:', error);
    }
    
    return {};
}

// Đọc biến môi trường từ file
const envVars = readEnvFile();

// Hàm kiểm tra cấu hình email
async function testEmailConfig() {
    console.log('===== BẮT ĐẦU KIỂM TRA CẤU HÌNH EMAIL =====');
    
    // Hiển thị thông tin cấu hình từ biến môi trường custom
    console.log('EMAIL_USERNAME từ process.env:', process.env.EMAIL_USERNAME);
    console.log('EMAIL_USERNAME từ custom:', envVars.EMAIL_USERNAME);
    console.log('EMAIL_PASSWORD từ custom:', envVars.EMAIL_PASSWORD ? 'Đã cấu hình' : 'Chưa cấu hình');
    console.log('EMAIL_HOST từ custom:', envVars.EMAIL_HOST);
    console.log('EMAIL_PORT từ custom:', envVars.EMAIL_PORT);
    console.log('EMAIL_SECURE từ custom:', envVars.EMAIL_SECURE);
    
    try {
        // Tạo transporter test với biến môi trường từ custom
        const transporter = nodemailer.createTransport({
            host: envVars.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(envVars.EMAIL_PORT) || 587,
            secure: envVars.EMAIL_SECURE === 'true',
            auth: {
                user: envVars.EMAIL_USERNAME,
                pass: envVars.EMAIL_PASSWORD,
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
            from: `"Debug Test" <${envVars.EMAIL_USERNAME}>`,
            to: envVars.EMAIL_USERNAME, // Gửi cho chính mình
            subject: "Email Test từ Debug Checkout",
            text: "Đây là email test để kiểm tra cấu hình",
            html: "<b>Đây là email test để kiểm tra cấu hình</b>",
        });
        
        console.log('Email đã gửi:', info.messageId);
        console.log('===== KIỂM TRA THÀNH CÔNG =====');
        
    } catch (error) {
        console.error('===== LỖI KIỂM TRA EMAIL =====');
        console.error('Chi tiết lỗi:', error);
        console.log('Stack trace:', error.stack);
    }
}

// Hàm debug cho email service
const debugEmail = async ({ to, subject, html }) => {
    console.log('===== DEBUG GỬI EMAIL =====');
    console.log('Đang gửi email đến:', to);
    console.log('Tiêu đề:', subject);
    console.log('Nội dung HTML:', html.substring(0, 100) + '...');
    
    try {
        const transporter = nodemailer.createTransport({
            host: envVars.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(envVars.EMAIL_PORT) || 587,
            secure: envVars.EMAIL_SECURE === 'true',
            auth: {
                user: envVars.EMAIL_USERNAME,
                pass: envVars.EMAIL_PASSWORD,
            },
            debug: true
        });
        
        const result = await transporter.sendMail({
            from: `"Cửa hàng của bạn" <${envVars.EMAIL_USERNAME}>`,
            to: to,
            subject: subject,
            html: html,
        });
        
        console.log('Kết quả gửi email:', result);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('LỖI GỬI EMAIL:', error);
        console.log('Stack trace:', error.stack);
        return { success: false, error: error.message };
    }
};

// Hàm debug cho cart checkout
const debugCheckout = (shippingInfo) => {
    console.log('===== DEBUG CHECKOUT =====');
    console.log('shippingInfo:', JSON.stringify(shippingInfo, null, 2));
    console.log('shippingInfo.email:', shippingInfo.email);
    console.log('Kiểm tra email có tồn tại:', shippingInfo.email ? 'Có' : 'Không');
};

// Chạy hàm test khi file này được thực thi trực tiếp
if (require.main === module) {
    testEmailConfig().catch(console.error);
}

module.exports = {
    testEmailConfig,
    debugEmail,
    debugCheckout,
    envVars
}; 