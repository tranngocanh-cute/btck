"use-strict";
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIATION: "authorization",
  REFRESHTOKEN: "x-rftoken-id",
};
const { findByUserId } = require("../services/keytoken.service");
const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("Lỗi xác minh token:", err);
      } else {
        console.log("Token đã được giải mã thành công:", decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Lỗi tạo cặp token:", error);
    throw error;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    return res.status(401).json({ message: "Client id is required" });
  }

  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    return res.status(401).json({ message: "Client id is invalid" });
  }

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = await JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        return res.status(401).json({ message: "Invalid User)" });
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "refresh token is invalid)" });
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIATION];
  if (!accessToken) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      return res.status(401).json({ message: "Invalid User)" });
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Access token is invalid)" });
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
