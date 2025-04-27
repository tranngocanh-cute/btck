'use strict'

const express = require('express')
const cartController = require('../../controller/cart.controller')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtilts')

// Đảm bảo tất cả các route đều cần xác thực
router.use(authentication)

// Thêm sản phẩm vào giỏ hàng - POST: /v1/api/cart/addToCart
router.post('/addToCart', asyncHandler(cartController.addToCart))

// Lấy thông tin giỏ hàng của user - GET: /v1/api/cart/getCart
router.get('/getCart', asyncHandler(cartController.getCart))

// Cập nhật số lượng sản phẩm - PATCH: /v1/api/cart/updateQuantity
router.patch('/updateQuantity', asyncHandler(cartController.updateQuantity))

// Xóa sản phẩm khỏi giỏ hàng - DELETE: /v1/api/cart/deleteItem/:productId
router.delete('/deleteItem/:productId', asyncHandler(cartController.deleteItem))

// Thanh toán giỏ hàng - POST: /v1/api/cart/checkout
router.post('/checkout', asyncHandler(cartController.checkout))

module.exports = router 