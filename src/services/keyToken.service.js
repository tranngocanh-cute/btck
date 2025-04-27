"use-strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");
class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // const tokens = await keytokenModel.create({
      //     user: userId,
      //     publicKey,
      //     privateKey
      // })
      // return tokens ? tokens.publicKey : null
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokenUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      throw new Error(error);
    }
  };

  static findByUserId = async (userId) => {
    try {
      if (typeof userId === "string" && Types.ObjectId.isValid(userId)) {
        return await keytokenModel.findOne({ user: userId });
      } else {
        throw new Error("userId phải là chuỗi ObjectId hợp lệ");
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.findByIdAndDelete(id);
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshTokenUsed: refreshToken });
  };
  static deleteKeyById = async (userId) => {
    try {
        if (typeof userId === "string" && Types.ObjectId.isValid(userId)) {
          return await keytokenModel.deleteOne({ user: userId });
        } else {
          throw new Error("userId phải là chuỗi ObjectId hợp lệ");
        }
      } catch (error) {
        throw new Error(error);
      }
  };
  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };
}

module.exports = KeyTokenService;
