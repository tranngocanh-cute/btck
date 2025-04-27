'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const orderController = require('../../controller/order.controller');
const { authentication } = require('../../auth/authUtilts');
const router = express.Router();

// Áp dụng authentication cho tất cả các routes
router.use(authentication);

// Lấy danh sách đơn hàng của người dùng hiện tại
router.get('/', asyncHandler(orderController.getMyOrders));

// Lấy chi tiết đơn hàng
router.get('/:id', asyncHandler(orderController.getOrderDetail));

// Hủy đơn hàng
router.post('/:id/cancel', asyncHandler(orderController.cancelOrder));

// Cập nhật trạng thái đơn hàng (có thể áp dụng check quyền admin tại đây nếu cần)
router.patch('/:id/status', asyncHandler(orderController.updateOrderStatus));

// Cập nhật trạng thái thanh toán (chỉ admin)
router.patch('/:id/payment', asyncHandler(orderController.updatePaymentStatus));

module.exports = router; 