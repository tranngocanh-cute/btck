"use-strict";

const { product, clothing, electronic } = require("../../models/product.model");
const { Types, model } = require("mongoose");
const { getSelectData, unGetSelectData } = require("../../utils/index");
const { checkProductStock } = require("../repositories/inventory.repo");
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../core/error.response');

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const findAllPushlishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const publishProductForShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });
  if (!foundShop) throw new Error("Product not found");
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};
const unpublishProductForShop = async ({ product_id, product_shop }) => {
  console.log('Unpublish attempt:', { product_id, product_shop });

  // Trước tiên kiểm tra xem sản phẩm có tồn tại không
  let productExists;
  try {
    productExists = await product.findOne({
      _id: new Types.ObjectId(product_id)
    });
  } catch (error) {
    console.error('Error converting ID:', error.message);
    throw new BadRequestError("Invalid product ID format");
  }

  // Nếu sản phẩm không tồn tại
  if (!productExists) {
    console.error('Product does not exist with ID:', product_id);
    throw new NotFoundError("Product not found");
  }

  // Kiểm tra quyền sở hữu
  if (productExists.product_shop.toString() !== product_shop.toString()) {
    console.error('Permission denied:', { 
      productOwner: productExists.product_shop.toString(), 
      requestUser: product_shop.toString() 
    });
    throw new ForbiddenError("You don't have permission to unpublish this product");
  }

  // Nếu bạn ở đây, có nghĩa bạn là chủ sở hữu
  productExists.isDraft = true;
  productExists.isPublished = false;
  const { modifiedCount } = await productExists.updateOne(productExists);
  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort == "ctime" ? { _id: -1 } : { id: 1 };
  
  // Make sure product_images is included in the select array if provided
  if (select && !select.includes('product_images')) {
    select.push('product_images');
  }
  
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .select('isDraft isPublished product_quantity')
    .lean();

  // Bổ sung thông tin trạng thái tồn kho
  const productsWithStockStatus = await Promise.all(products.map(async (prod) => {
    const stockInfo = await checkProductStock({ productId: prod._id, quantity: 1 });
    let stock_status = 'in_stock';
    if (!stockInfo || stockInfo.availableStock <= 0) {
        stock_status = 'out_of_stock';
    }
    return { ...prod, stock_status };
  }));

  return productsWithStockStatus;
};

const findProduct = async ({ unSelect, product_id }) => {
  const foundProduct = await product
    .findById(product_id)
    .select(unGetSelectData(unSelect))
    .select('isDraft isPublished product_shop product_name product_price product_thumb product_images product_quantity')
    .lean()
    .exec();

  if (!foundProduct) return null;

  // Bổ sung thông tin trạng thái tồn kho
  const stockInfo = await checkProductStock({ productId: foundProduct._id, quantity: 1 });
  let stock_status = 'in_stock';
  if (!stockInfo || stockInfo.availableStock <= 0) {
      stock_status = 'out_of_stock';
  }

  return { ...foundProduct, stock_status };
};

const queryProduct = async ({ query, limit, skip }) => {
  const products = await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .select('product_name product_thumb product_images product_description product_price product_quantity product_type product_shop product_attributes isDraft isPublished createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  // Bổ sung thông tin trạng thái tồn kho
  const productsWithStockStatus = await Promise.all(products.map(async (prod) => {
    const stockInfo = await checkProductStock({ productId: prod._id, quantity: 1 });
    let stock_status = 'in_stock';
    if (!stockInfo || stockInfo.availableStock <= 0) {
        stock_status = 'out_of_stock';
    }
    return { ...prod, stock_status };
  }));

  return productsWithStockStatus;
};

const searchProductByUser = async ({ keySearch, limit = 50, skip = 0 }) => {
  if (typeof keySearch !== "string") {
    throw new Error("keySearch phải là một chuỗi");
  }

  // Kiểm tra xem keySearch có phải là một loại sản phẩm không
  const productTypes = ["Electronics", "Clothing", "Furniture", "Laptop", "iPhone", "AirPort", "AirPods", "iPad"];
  const isProductType = productTypes.includes(keySearch);

  let searchQuery;

  if (isProductType) {
    // Tìm kiếm theo product_type
    searchQuery = {
      isDraft: false,
      isPublished: true,
      product_type: keySearch
    };
  } else {
    // Tìm kiếm theo tên và mô tả (sử dụng text index)
    searchQuery = {
      isDraft: false,
      isPublished: true,
      $text: { $search: keySearch }
    };
  }

  // Nếu là tìm kiếm text, sử dụng score để sắp xếp
  const options = isProductType ? {} : { score: { $meta: "textScore" } };
  
  const results = await product
    .find(searchQuery, options)
    .select('product_name product_thumb product_images product_description product_price product_quantity product_type product_shop product_attributes isDraft isPublished createdAt updatedAt')
    .sort(isProductType ? { updatedAt: -1 } : { score: { $meta: "textScore" } })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  // Bổ sung thông tin trạng thái tồn kho
  const resultsWithStockStatus = await Promise.all(results.map(async (prod) => {
    const stockInfo = await checkProductStock({ productId: prod._id, quantity: 1 });
    let stock_status = 'in_stock';
    if (!stockInfo || stockInfo.availableStock <= 0) {
        stock_status = 'out_of_stock';
    }
    return { ...prod, stock_status };
  }));

  return resultsWithStockStatus;
};

const updateProductById = async ({ product_id, bodyUpdate, model }) => {
  return await model.findByIdAndUpdate(
    product_id,
    { $set: bodyUpdate },
    { new: true }
  );
};

// Cập nhật số lượng sản phẩm khi thêm vào giỏ hàng
const updateProductQuantity = async ({ productId, quantity }) => {
  return await product.findByIdAndUpdate(
    productId,
    { $inc: { product_quantity: -quantity } },
    { new: true }
  );
};

// Tìm các sản phẩm hot
const findHotProducts = async ({ limit = 10, skip = 0 }) => {
  const query = { isPublished: true, product_hot: true };
  const products = await product
    .find(query)
    .sort({ updatedAt: -1 }) // Sắp xếp theo cập nhật mới nhất (có thể thay đổi)
    .skip(skip)
    .limit(limit)
    .select('product_name product_thumb product_images product_price product_type product_shop product_attributes product_description') // Thêm product_attributes và product_description
    .lean()
    .exec();

  // Bổ sung thông tin trạng thái tồn kho
  const productsWithStockStatus = await Promise.all(products.map(async (prod) => {
    const stockInfo = await checkProductStock({ productId: prod._id, quantity: 1 });
    let stock_status = 'in_stock';
    if (!stockInfo || stockInfo.availableStock <= 0) {
      stock_status = 'out_of_stock';
    }
    return { ...prod, stock_status };
  }));

  return productsWithStockStatus;
};

module.exports = {
  findAllDraftsForShop,
  publishProductForShop,
  findAllPushlishForShop,
  unpublishProductForShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  updateProductQuantity,
  findHotProducts
};
