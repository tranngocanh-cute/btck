"use strict";
const shopModel = require("../models/shop.model");  
const bcrypt = require("bcrypt"); // passw
const crypto = require("crypto"); // public key -private key 
const KeyTokenService = require("../services/keytoken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtilts");
const { getInfoData } = require("../utils");
const { BadRequestError, ConflictError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  //refresh token

    static refreshToken = async ({ keyStore, user, refreshToken }) => {
      const { userId, email } = user;
      if (keyStore.refreshTokenUsed.includes(refreshToken)) {
        await KeyTokenService.deleteKeyById(userId);
        throw new BadRequestError("Token đã được sử dụng login lai di");
      }

      if (keyStore.refreshToken !== refreshToken) {
        throw new BadRequestError("Shop chua dang ky");
      }
      const foundShop = await findByEmail({ email });
      if (!foundShop) throw new BadRequestError("Email không tồn tại");
      const tokens = await createTokenPair(
        { userId, email },
        keyStore.publicKey,
        keyStore.privateKey
      );
      await keyStore.updateOne({
        $set: {
          refreshToken: tokens.refreshToken,
        },
        $addToSet: {
          refreshTokenUsed: refreshToken,
        },
      });
      return {
        user: getInfoData({
          fileds: ["_id", "name", "email", "roles"],
          object: foundShop,
        }),
        tokens,
      };
    };
  // dang xuat

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);// xóa luôn cái keystore chứa Pu và Pri k
    return delKey;
  };

  // đăng nhập
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Email không tồn tại");
    }
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new BadRequestError("Mật khẩu không đúng");

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
      userId: foundShop._id,
    });
    return {
      shop: getInfoData({
        fileds: ["_id", "name", "email", "roles"],
        object: foundShop,
      }),
      tokens,
    };
  };

  //đăng ký
  static signUp = async ({ name, email, password, roles = [RoleShop.SHOP] }) => {
    // try {
    // check email exist
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Email đã tồn tại");
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);
    
    // create shop
    const newShop = await shopModel.create({
      name,
      email,
      password: hashPassword,
      roles: roles,
    });

    if (newShop) {
      // created privateKey, publicKey
      //thuật toán này xịn
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      // Public key CryptoGraphy Standards !

      //cách đơn giản
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey });

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new ConflictError("Tạo key thất bại");
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log(`Created token success:`, tokens);

      return {
        code: "201",
        metadata: {
          shop: getInfoData({
            fileds: ["_id", "name", "email", "roles"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = AccessService;
