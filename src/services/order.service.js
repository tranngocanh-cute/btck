'use strict';

const { BadRequestError, NotFoundError, ForbiddenError } = require('../core/error.response');
const { order } = require('../models/order.model');
const { findOrdersByUser, findOrderById, updateOrderStatus, updatePaymentStatus, countOrdersByUser } = require('../models/repositories/order.repo');

class OrderService {
  /**
   * Lấy danh sách đơn hàng của người dùng
   */
  static async getOrdersByUser({
    userId,
    limit = 20,
    page = 1,
    sort = 'ctime',
    status = null
  }) {
    // Lấy danh sách đơn hàng
    const orders = await findOrdersByUser({
      userId,
      limit,
      page,
      sort,
      status
    });

    // Đếm tổng số đơn hàng (cho pagination)
    const totalOrders = await countOrdersByUser({
      userId,
      status
    });

    return {
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit)
      }
    };
  }

  /**
   * Lấy chi tiết một đơn hàng
   */
  static async getOrderDetail({ orderId, userId }) {
    const order = await findOrderById({ 
      orderId, 
      userId // Đảm bảo chỉ xem được đơn hàng của chính mình
    });

    if (!order) {
      throw new NotFoundError('Order not found or you do not have permission to view it');
    }

    return order;
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * Chú ý: Thường thì chỉ admin/shop owner mới có quyền thay đổi tất cả các trạng thái
   * Người dùng thông thường chỉ có thể hủy đơn (trong một số trường hợp)
   */
  static async updateOrderStatus({ orderId, userId, status, isAdmin = false }) {
    // Kiểm tra đơn hàng tồn tại
    const existingOrder = await findOrderById({ orderId });
    
    if (!existingOrder) {
      throw new NotFoundError('Order not found');
    }

    // Nếu không phải admin, kiểm tra đơn hàng có thuộc về người dùng không
    if (!isAdmin && existingOrder.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to update this order');
    }

    // Nếu không phải admin và đang cố gắng chuyển sang trạng thái không cho phép
    if (!isAdmin && !['cancelled'].includes(status)) {
      throw new ForbiddenError('You can only cancel the order');
    }

    // Nếu đơn hàng đã chuyển sang trạng thái không thể thay đổi
    if (['delivered', 'cancelled'].includes(existingOrder.status)) {
      throw new BadRequestError(`Cannot update order in ${existingOrder.status} status`);
    }

    // Nếu đơn hàng đang vận chuyển, chỉ có thể chuyển sang delivered
    if (existingOrder.status === 'shipping' && status !== 'delivered' && !isAdmin) {
      throw new BadRequestError('Cannot change status of shipping order except to delivered');
    }

    // Thực hiện cập nhật trạng thái
    const updatedOrder = await updateOrderStatus({
      orderId,
      status
    });

    return updatedOrder;
  }

  /**
   * Cập nhật trạng thái thanh toán (chủ yếu cho admin)
   */
  static async updatePaymentStatus({ orderId, isPaid, isAdmin = false }) {
    // Kiểm tra đơn hàng tồn tại
    const existingOrder = await findOrderById({ orderId });
    
    if (!existingOrder) {
      throw new NotFoundError('Order not found');
    }

    // Chỉ admin mới có quyền cập nhật trạng thái thanh toán
    if (!isAdmin) {
      throw new ForbiddenError('You do not have permission to update payment status');
    }

    // Thực hiện cập nhật trạng thái thanh toán
    const updatedOrder = await updatePaymentStatus({
      orderId,
      isPaid
    });

    return updatedOrder;
  }

  /**
   * Hủy đơn hàng (dành cho người dùng)
   */
  static async cancelOrder({ orderId, userId }) {
    return await this.updateOrderStatus({
      orderId,
      userId,
      status: 'cancelled',
      isAdmin: false
    });
  }

  /**
   * Lấy tất cả đơn hàng trong hệ thống (chỉ dành cho admin)
   */
  static async getAllOrders({
    limit = 20,
    page = 1,
    sort = 'ctime',
    status = null,
    userId = null
  }) {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { createdAt: -1 } : { updatedAt: -1 };
    
    // Xây dựng query dựa vào các tham số
    const query = {};
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }

    // Lấy dữ liệu đơn hàng
    const orders = await order
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email') // Lấy thêm thông tin về người dùng
      .lean();

    // Đếm tổng số đơn hàng
    const totalOrders = await order.countDocuments(query);

    return {
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit)
      }
    };
  }
}

module.exports = OrderService; 