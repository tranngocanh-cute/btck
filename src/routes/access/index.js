// access.router.js
"use strict";
const { authentication } = require("../../auth/authUtilts");
const express = require("express");
const accessController = require("../../controller/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

// Các route công khai
router.post("/shop/login", asyncHandler(accessController.login));
router.post("/shop/signup", asyncHandler(accessController.signUp));

// Các route bảo vệ
router.post("/shop/logout", authentication, asyncHandler(accessController.logout));
router.post("/shop/refreshToken", authentication, asyncHandler(accessController.refreshToken));

module.exports = router;
