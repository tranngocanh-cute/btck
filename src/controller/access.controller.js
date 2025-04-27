'use strict';
const AccessService = require("../services/access.service");
const {OK, CREATED} = require('../core/success.response')
class AcessController {

  async refreshToken(req, res, next) {
    new OK({
      message: "Refresh token successfully",
      metadata: await AccessService.refreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      }),
    }).send(res)
  }

  async logout(req, res, next) {
    new OK({
      message: "Login successfully",
      metadata: await AccessService.logout( req.keyStore ),
    }).send(res)
      // return res.status(200).json(await AccessService.login(req.body
  }

    async login(req, res, next) {
      new OK({
        message: "Login successfully",
        metadata: await AccessService.login(req.body),
      }).send(res)
        // return res.status(200).json(await AccessService.login(req.body
    }

    async signUp(req, res, next) {
      new CREATED({
        message: "Register successfully",
        metadata : await AccessService.signUp(req.body),
        options: {
          limit: 10
        }
      }).send(res)
        // return res.status(201).json(await AccessService.signUp(req.body));
    }
  }
  
  module.exports = new AcessController();
