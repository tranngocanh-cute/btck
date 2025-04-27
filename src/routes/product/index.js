// product.router.js
"use strict";
const { authentication } = require("../../auth/authUtilts");
const express = require("express");
const productController = require("../../controller/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

// Routes công khai (không cần đăng nhập)
router.get("/product/hot", asyncHandler(productController.getHotProducts));
router.get("/product/findOne/:product_id", asyncHandler(productController.findOneProducts));

// Các route yêu cầu xác thực (cho admin/shop)
router.use(authentication); // Áp dụng authentication cho các route bên dưới

router.post("/product/create", asyncHandler(productController.createProduct));
router.patch("/product/update/:productId", asyncHandler(productController.updateProduct));
router.post("/product/published/:id", asyncHandler(productController.publishOneProduct));
router.post("/product/unpublished/:id", asyncHandler(productController.unPublishOneProduct));

router.get("/product/draft", asyncHandler(productController.getAllDraftForShop)); // Lấy draft của shop đang đăng nhập
router.get("/product/published", asyncHandler(productController.getAllPushlishedForShop)); // Lấy published của shop đang đăng nhập

module.exports = router;
