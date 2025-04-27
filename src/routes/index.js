"use-strict";
const { authentication } = require("../auth/authUtilts");
const express = require("express");
const router = express.Router();

// Access routes - không cần xác thực
router.use("/v1/api", require("./access"));

// Public product routes - không cần xác thực
router.use("/v1/api", require("./public"));

// Cart routes - cần xác thực
router.use("/v1/api/cart", require("./cart"));

// Product routes - cần xác thực bằng access token (chỉ cho các route admin/cập nhật)
router.use("/v1/api", authentication, require("./product"));

module.exports = router;
