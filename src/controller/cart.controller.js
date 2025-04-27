'use strict'

const CartService = require('../services/cart.service')
const { OK, CREATED } = require('../core/success.response')

class CartController {
    // Thêm sản phẩm vào giỏ hàng
    async addToCart(req, res, next) {
        new CREATED({
            message: 'Product added to cart successfully',
            metadata: await CartService.addToCart({
                userId: req.user.userId,
                product: {
                    productId: req.body.productId,
                    quantity: req.body.quantity || 1
                }
            })
        }).send(res)
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    async updateQuantity(req, res, next) {
        new OK({
            message: 'Cart updated successfully',
            metadata: await CartService.updateQuantity({
                userId: req.user.userId,
                productId: req.body.productId,
                quantity: req.body.quantity
            })
        }).send(res)
    }

    // Xóa sản phẩm khỏi giỏ hàng
    async deleteItem(req, res, next) {
        new OK({
            message: 'Product removed from cart successfully',
            metadata: await CartService.removeFromCart({
                userId: req.user.userId,
                productId: req.params.productId
            })
        }).send(res)
    }

    // Xem giỏ hàng
    async getCart(req, res, next) {
        new OK({
            message: 'Get cart successfully',
            metadata: await CartService.getCart({
                userId: req.user.userId
            })
        }).send(res)
    }

    // Checkout - Thanh toán giỏ hàng
    async checkout(req, res, next) {
        new OK({
            message: 'Checkout completed successfully',
            metadata: await CartService.checkout({
                userId: req.user.userId,
                productIds: req.body.productIds || [], // Danh sách sản phẩm cần thanh toán
                customerInfo: {
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    address: req.body.address,
                    city: req.body.city,
                    zipCode: req.body.zipCode,
                    note: req.body.note
                }
            })
        }).send(res)
    }
}

module.exports = new CartController(); 