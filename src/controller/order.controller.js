'use strict';

const OrderService = require('../services/order.service');
const { OK, CREATED } = require('../core/success.response');
const { ForbiddenError } = require('../core/error.response');

class OrderController {
  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  getMyOrders = async (req, res, next) => {
    new OK({
      message: 'Get my orders success',
      metadata: await OrderService.getOrdersByUser({
        userId: req.user.userId,
        limit: parseInt(req.query.limit) || 20,
        page: parseInt(req.query.page) || 1,
        sort: req.query.sort || 'ctime',
        status: req.query.status || null
      }),
    }).send(res);
  };

  /**
   * Lấy chi tiết một đơn hàng
   */
  getOrderDetail = async (req, res, next) => {
    new OK({
      message: 'Get order detail success',
      metadata: await OrderService.getOrderDetail({
        orderId: req.params.id,
        userId: req.user.userId
      }),
    }).send(res);
  };

  /**
   * Hủy đơn hàng
   */
  cancelOrder = async (req, res, next) => {
    new OK({
      message: 'Cancel order success',
      metadata: await OrderService.cancelOrder({
        orderId: req.params.id,
        userId: req.user.userId
      }),
    }).send(res);
  };

  /**
   * Admin: Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus = async (req, res, next) => {
    new OK({
      message: 'Update order status success',
      metadata: await OrderService.updateOrderStatus({
        orderId: req.params.id,
        userId: req.user.userId,
        status: req.body.status,
        isAdmin: req.user.roles.includes('ADMIN')
      }),
    }).send(res);
  };

  /**
   * Admin: Cập nhật trạng thái thanh toán
   */
  updatePaymentStatus = async (req, res, next) => {
    new OK({
      message: 'Update payment status success',
      metadata: await OrderService.updatePaymentStatus({
        orderId: req.params.id,
        isPaid: req.body.isPaid,
        isAdmin: req.user.roles.includes('ADMIN')
      }),
    }).send(res);
  };

  /**
   * Admin: Lấy tất cả đơn hàng trong hệ thống
   */
  getAllOrders = async (req, res, next) => {
    // Kiểm tra quyền admin
    if (!req.user.roles.includes('ADMIN')) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    new OK({
      message: 'Get all orders success',
      metadata: await OrderService.getAllOrders({
        limit: parseInt(req.query.limit) || 20,
        page: parseInt(req.query.page) || 1,
        sort: req.query.sort || 'ctime',
        status: req.query.status || null,
        userId: req.query.userId || null // Để lọc theo userId nếu admin muốn
      }),
    }).send(res);
  };
}

module.exports = new OrderController(); 