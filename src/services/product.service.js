"use-strict";

const { product, clothing, electronic, laptop, iphone, airport, airpods, ipad } = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const {
  findAllDraftsForShop,
  publishProductForShop,
  findAllPushlishForShop,
  searchProductByUser,
  unpublishProductForShop,
  findAllProducts,
  findProduct,
  updateProductById,
  findHotProducts
} = require("../models/repositories/product.repo");
const { removeUndefindObject, updateNestedObjectParser } = require("../utils");
// define Factory class to create product

class ProductFactory {
  static productRegistry = {};

  static registerProduct(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }
  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new Error(`Invalid product type ${type}`);
    }
    return await new productClass(payload).createProduct();
  }
static async updateProduct(type, productId, payload) {
  const productClass = ProductFactory.productRegistry[type];
  if (!productClass) {
    throw new Error(`Invalid product type ${type}`);
  }
  return await new productClass(payload).updateProduct(productId);
}
  // PUSHLISH PRODUCT

  static async publishProduct({ product_id, product_shop }) {
    return await publishProductForShop({ product_id, product_shop });
  }
  static async unPublishProduct({ product_id, product_shop }) {
    return await unpublishProductForShop({ product_id, product_shop });
  }
  // search product

  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  // GET DRAFTS PRODUCTS
  static async getProductDrafts({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  // get published products

  static async getProductPushlist({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPushlishForShop({ query, limit, skip });
  }

  // find all products

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
    select = ["product_name", "product_thumb", "product_price"]
  }) {
    const defaultSelect = ["product_name", "product_thumb", "product_price"];
    const finalSelect = select && select.length > 0 ? select : defaultSelect;

    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: finalSelect,
    });
  }

  //find one product
  static async findOneProduct({ product_id }) {
    return await findProduct({
      product_id,
      unSelect: ["__v"],
    });
  }

  // HÀM MỚI: Lấy danh sách sản phẩm hot
  static async findHotProducts({ limit = 10, page = 1 }) {
    const skip = (page - 1) * limit;
    return await findHotProducts({ limit, skip });
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_images,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
    product_hot
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_images = product_images || []; // Array of additional product images
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_hot = product_hot ?? false; // Gán giá trị, mặc định là false
    // Mặc định publish sản phẩm ngay khi tạo (có thể điều chỉnh logic này nếu cần)
    this.isDraft = false;
    this.isPublished = true;
  }

  async createProduct(product_id) {
    // Validate images limit
    if (this.product_images && this.product_images.length > 5) {
      throw new Error("Không thể tải lên quá 5 ảnh cho sản phẩm");
    }
    
    const newProduct = await product.create({...this, _id:product_id})
    if(newProduct){
      await insertInventory({
        productId: newProduct._id,
        stock:this.product_quantity,
        shopId: this.product_shop,
      })
    }
    return newProduct
  }

  //update Product

  async updateProduct(product_id, bodyUpdate){
    return await updateProductById({product_id, bodyUpdate,model:product})
  }
}

// Defind sub-class for differrent product types clothing

class Clothing extends Product {

  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new Error("Cannot create new clothing");
    }
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = removeUndefindObject(this);
    if (objectParams.product_attributes) {
      await updateProductById({ productId, 
        bodyUpdate:updateNestedObjectParser(objectParams.product_attributes) ,
         model: clothing });
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    return updateProduct;
  }
}
class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) {
      throw new Error("Cannot create new clothing");
    }
    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
  async updateProduct(productId){
    const objectParams = removeUndefindObject(this);
    if(objectParams.product_attributes){
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: electronic});
      }
      const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
      return updateProduct
      };
    }

class Laptop extends Product {
  async createProduct() {
    const newLaptop = await laptop.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newLaptop) {
      throw new Error("Cannot create new laptop");
    }
    const newProduct = await super.createProduct(newLaptop._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
  
  async updateProduct(productId){
    const objectParams = removeUndefindObject(this);
    if(objectParams.product_attributes){
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: laptop});
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    return updateProduct;
  }
}

class IPhone extends Product {
  async createProduct() {
    const newIPhone = await iphone.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newIPhone) {
      throw new Error("Cannot create new iPhone");
    }
    const newProduct = await super.createProduct(newIPhone._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
  
  async updateProduct(productId){
    const objectParams = removeUndefindObject(this);
    if(objectParams.product_attributes){
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: iphone});
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    return updateProduct;
  }
}

class AirPort extends Product {
  async createProduct() {
    const newAirPort = await airport.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newAirPort) {
      throw new Error("Cannot create new AirPort");
    }
    const newProduct = await super.createProduct(newAirPort._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
  
  async updateProduct(productId){
    const objectParams = removeUndefindObject(this);
    if(objectParams.product_attributes){
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: airport});
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    return updateProduct;
  }
}

class AirPods extends Product {
  async createProduct() {
    const newAirPods = await airpods.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newAirPods) {
      throw new Error("Cannot create new AirPods");
    }
    const newProduct = await super.createProduct(newAirPods._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
  
  async updateProduct(productId){
    const objectParams = removeUndefindObject(this);
    if(objectParams.product_attributes){
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: airpods});
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    return updateProduct;
  }
}

class IPad extends Product {
  async createProduct() {
    const newIPad = await ipad.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newIPad) {
      throw new Error("Cannot create new iPad");
    }
    const newProduct = await super.createProduct(newIPad._id);
    if (!newProduct) {
      throw new Error("Cannot create new product");
    }
    return newProduct;
  }
  
  async updateProduct(productId){
    const objectParams = removeUndefindObject(this);
    if(objectParams.product_attributes){
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: ipad});
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
    return updateProduct;
  }
}

ProductFactory.registerProduct("Clothing", Clothing);
ProductFactory.registerProduct("Electronics", Electronics);
ProductFactory.registerProduct("Laptop", Laptop);
ProductFactory.registerProduct("iPhone", IPhone);
ProductFactory.registerProduct("AirPort", AirPort);
ProductFactory.registerProduct("AirPods", AirPods);
ProductFactory.registerProduct("IPad", IPad);

module.exports = ProductFactory;
