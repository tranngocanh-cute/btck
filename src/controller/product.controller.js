"use strict";
const ProductService = require("../services/product.service");
const { OK, CREATED } = require("../core/success.response");
class ProductController {
  createProduct = async (req, res, next) => {
    new CREATED({
      message: "Product created",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

//update product
  updateProduct = async (req, res , next) =>{
    new OK({
      message: 'Update Product Success!!',
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
        ...req.body,
        product_shop: req.user.userId,
      })
    }).send(res)
  }
  
  publishOneProduct = async (req, res, next) => {
    new CREATED({
      message: "Product published",
      metadata: await ProductService.publishProduct({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  unPublishOneProduct = async (req, res, next) => {
    console.log('Unpublish controller called with:', {
      id: req.params.id,
      userId: req.user.userId,
      productId: req.params.id
    });
    
    new CREATED({
      message: "Product UnPublished",
      metadata: await ProductService.unPublishProduct({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  //QUERY //
  /**
   * @description get all draft products
   */
  getAllDraftForShop = async (req, res, next) => {
    new OK({
      message: "get All draft products",
      metadata: await ProductService.getProductDrafts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPushlishedForShop = async (req, res, next) => {
    new OK({
      message: "get All published products",
      metadata: await ProductService.getProductPushlist({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // Phương thức mới để lấy tất cả sản phẩm đã publish (công khai)
  getAllPublishedProducts = async (req, res, next) => {
    new OK({
      message: "get All published products",
      metadata: await ProductService.findAllProducts({
        limit: req.query.limit || 50,
        sort: req.query.sort || 'ctime',
        page: req.query.page || 1,
        filter: { isPublished: true }
      }),
    }).send(res);
  };

  // Phương thức mới gộp cả search và findAll
  searchProducts = async (req, res, next) => {
    const keySearch = req.params.keySearch;
    
    if (keySearch) {
      // Nếu có từ khóa tìm kiếm, thực hiện tìm kiếm
      new OK({
        message: "search success",
        metadata: await ProductService.searchProduct({ keySearch }),
      }).send(res);
    } else {
      // Nếu không có từ khóa, lấy tất cả sản phẩm
      new OK({
        message: "get all products",
        metadata: await ProductService.findAllProducts(req.query),
      }).send(res);
    }
  };

  // Các phương thức cũ giữ lại để đảm bảo khả năng tương thích ngược
  getListSearchProduct = async (req, res, next) => {
    new CREATED({
      message: "search success",
      metadata: await ProductService.searchProduct(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new OK({
      message: "get all products",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  findOneProducts = async (req, res, next) => {
    new OK({
      message: "get detail products",
      metadata: await ProductService.findOneProduct({product_id: req.params.product_id})
    }).send(res);
  };

  // HÀM MỚI: Lấy danh sách sản phẩm hot
  getHotProducts = async (req, res, next) => {
    new OK({
      message: "Get Hot Products Success!",
      metadata: await ProductService.findHotProducts({
          limit: parseInt(req.query.limit) || 10,
          page: parseInt(req.query.page) || 1
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
