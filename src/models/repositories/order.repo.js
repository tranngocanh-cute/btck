'use strict';

const { order } = require('../order.model');
const { Types } = require('mongoose');

/**
 * Tạo một đơn hàng mới
 */
const createOrder = async ({ 
  userId, 
  products, 
  totalAmount, 
  shippingInfo, 
  paymentMethod = 'cod'
}) => {
  return await order.create({
    userId,
    products,
    totalAmount,
    shippingInfo,
    paymentMethod,
    status: 'pending',
    isPaid: false
  });
};

/**
 * Lấy tất cả đơn hàng của người dùng
 */
const findOrdersByUser = async ({ 
  userId, 
  limit = 20, 
  sort = 'ctime',
  page = 1,
  status = null
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { createdAt: -1 } : { updatedAt: -1 };
  
  // Xây dựng query dựa vào status
  const query = { userId: new Types.ObjectId(userId) };
  if (status) {
    query.status = status;
  }

  const orders = await order
    .find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();

  return orders;
};

/**
 * Lấy chi tiết một đơn hàng
 */
const findOrderById = async ({ orderId, userId = null }) => {
  const query = { _id: new Types.ObjectId(orderId) };
  
  // Nếu có userId, đảm bảo chỉ trả về đơn hàng của người dùng đó
  if (userId) {
    query.userId = new Types.ObjectId(userId);
  }
  
  return await order.findOne(query).lean();
};

/**
 * Cập nhật trạng thái đơn hàng
 */
const updateOrderStatus = async ({ orderId, status }) => {
  const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid order status');
  }
  
  let updateData = { status };
  
  // Cập nhật thêm các trường đặc biệt tùy theo trạng thái
  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }
  
  return await order.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true }
  );
};

/**
 * Cập nhật trạng thái thanh toán đơn hàng
 */
const updatePaymentStatus = async ({ orderId, isPaid = true }) => {
  const updateData = { 
    isPaid,
    paidAt: isPaid ? new Date() : null
  };
  
  return await order.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true }
  );
};

/**
 * Đếm tổng số đơn hàng của người dùng
 */
const countOrdersByUser = async ({ userId, status = null }) => {
  const query = { userId: new Types.ObjectId(userId) };
  
  if (status) {
    query.status = status;
  }
  
  return await order.countDocuments(query);
};

module.exports = {
  createOrder,
  findOrdersByUser,
  findOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  countOrdersByUser
}; 