'use strict';

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

// Định nghĩa schema cho các sản phẩm trong đơn hàng
const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  thumb: { type: String }
}, { _id: false });

// Định nghĩa schema cho thông tin giao hàng
const shippingInfoSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  zipCode: { type: String },
  note: { type: String }
}, { _id: false });

// Định nghĩa schema chính cho đơn hàng
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  products: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingInfo: { type: shippingInfoSchema, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'banking', 'credit_card', 'paypal'],
    default: 'cod'
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  deliveredAt: { type: Date }
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

// Tạo index
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = {
  order: model(DOCUMENT_NAME, orderSchema)
}; 