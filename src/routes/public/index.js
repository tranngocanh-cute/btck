"use strict";
const express = require("express");
const productController = require("../../controller/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

// Các route công khai cho sản phẩm
router.get("/product/search/:keySearch?", asyncHandler(productController.searchProducts));
router.get("/product/findOne/:product_id", asyncHandler(productController.findOneProducts));
router.get("/product/published", asyncHandler(productController.getAllPublishedProducts));
router.get("/product/hot", asyncHandler(productController.getHotProducts));

module.exports = router; 