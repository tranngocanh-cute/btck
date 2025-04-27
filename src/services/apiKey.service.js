"use-strict";

const apiKeyModel = require("../models/apiKey.model");
const crypto = require("crypto");

const createApiKey = async () => {
  const newKey = await apiKeyModel.create({
    key: crypto.randomBytes(64).toString("hex"),
    permissions: ["0000"]
  });
  console.log(newKey, 'New API key created');
  return newKey;
};

const findById = async (key) => {
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objKey;
};

module.exports = {
  findById,
  createApiKey
};
