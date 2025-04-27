"use-strict";

const { model, Schema } = require("mongoose");
const slugify = require('slugify');
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true }, // Main thumbnail image
    product_images: { 
      type: [String], 
      default: [], 
      validate: [
        {
          validator: function(images) {
            // Validate maximum 5 images
            return images.length <= 5;
          },
          message: 'Không thể tải lên quá 5 ảnh cho sản phẩm'
        }
      ]
    },
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, default: 0 },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture", "Laptop", "iPhone", "AirPort", "AirPods", "iPad"],
    },
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    product_attributes: { type: Schema.Types.Mixed, required: true },

    //
    product_ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating mút be above 0"],
      max: [5, "Rating must be above 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations : { type: Array, default: []},
    product_hot: { type: Boolean, default: false, index: true },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//create index for search

productSchema.index({ product_name: 'text', product_description: 'text' });

// Document middleware: runs before .save() and .create()

productSchema.pre("save", function (next) {
    this.product_slug = slugify(this.product_name, { lower: true });
    next();
});


//define the produc type = clothing

const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);
//define the produc type = echonics

const electronicSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

// Schema cho laptop
const laptopSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    screen_size: String,
    processor: String,
    ram: String,
    storage: String,
    battery: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "laptops",
    timestamps: true,
  }
);

// Schema cho iPhone
const iPhoneSchema = new Schema(
  {
    model: { type: String, required: true },
    color: String,
    storage: String,
    screen_size: String,
    camera: String,
    chip: String,
    battery: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "iphones",
    timestamps: true,
  }
);

// Schema cho AirPort
const airPortSchema = new Schema(
  {
    model: { type: String, required: true },
    type: String,
    range: String,
    frequency: String,
    ports: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "airports",
    timestamps: true,
  }
);

// Schema cho AirPods
const airPodsSchema = new Schema(
  {
    model: { type: String, required: true },
    color: String,
    noise_cancellation: Boolean,
    battery_life: String,
    water_resistant: Boolean,
    wireless_charging: Boolean,
    connectivity: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "airpods",
    timestamps: true,
  }
);

// Schema cho iPad
const iPadSchema = new Schema(
  {
    model: { type: String, required: true },
    color: String,
    storage: String,
    screen_size: String,
    resolution: String,
    processor: String,
    camera: String,
    battery: String,
    cellular: Boolean,
    pencil_support: Boolean,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "ipads",
    timestamps: true,
  }
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronic", electronicSchema),
  laptop: model("Laptop", laptopSchema),
  iphone: model("iPhone", iPhoneSchema),
  airport: model("AirPort", airPortSchema),
  airpods: model("AirPods", airPodsSchema),
  ipad: model("iPad", iPadSchema),
};
