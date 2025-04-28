'use strict'

const cartModel = require('../models/cart.model')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { findProduct, updateProductQuantity } = require('../models/repositories/product.repo')
const { product } = require('../models/product.model')
const { checkProductStock, reduceProductStock } = require('../models/repositories/inventory.repo')
const { sendEmail, generateOrderConfirmationEmail } = require('../helpers/email.helper')
const shopModel = require('../models/shop.model') // Thêm import để lấy thông tin người dùng
const { createOrder } = require('../models/repositories/order.repo')
const { debugCheckout, debugEmail } = require('../helpers/checkout-debug')

class CartService {
    // Thêm sản phẩm vào giỏ hàng
    static async addToCart({ userId, product }) {
        // Kiểm tra product ID
        const productData = await findProduct({ product_id: product.productId, unSelect: [] })
        if (!productData) {
            throw new NotFoundError('Product not found')
        }

        // Kiểm tra xem sản phẩm có được publish hay không
        if (!productData.isPublished) {
            throw new BadRequestError('Cannot add unpublished product to cart')
        }

        // Kiểm tra các trường bắt buộc của sản phẩm
        if (!productData.product_shop) {
            throw new BadRequestError('Product shop information is missing')
        }
        if (!productData.product_name) {
            throw new BadRequestError('Product name is missing')
        }
        if (productData.product_price === undefined || productData.product_price === null) {
            throw new BadRequestError('Product price is missing')
        }

        // Xác định số lượng sản phẩm yêu cầu
        const requestQuantity = product.quantity || 1;

        // Kiểm tra giỏ hàng hiện tại
        const userCart = await cartModel.findOne({ userId });
        let currentQuantity = 0;

        // Nếu sản phẩm đã có trong giỏ, cộng thêm số lượng hiện tại
        if (userCart) {
            const existingProduct = userCart.products.find(p => 
                p.productId.toString() === product.productId.toString()
            );
            if (existingProduct) {
                currentQuantity = existingProduct.quantity;
            }
        }

        // Tổng số lượng sản phẩm cần kiểm tra
        const totalQuantityNeeded = requestQuantity + currentQuantity;

        // Kiểm tra số lượng sản phẩm trong kho
        const stockCheck = await checkProductStock({ 
            productId: product.productId, 
            quantity: totalQuantityNeeded 
        });

        if (!stockCheck.isEnough) {
            // Trả về mã lỗi cụ thể dựa trên status code
            if (stockCheck.statusCode === 'OUT_OF_STOCK') {
                throw new BadRequestError('Sản phẩm đã hết');
            } else if (stockCheck.statusCode === 'NOT_FOUND_INVENTORY') {
                throw new BadRequestError('Sản phẩm không tồn tại trong kho');
            } else {
                throw new BadRequestError(stockCheck.message);
            }
        }

        // Log để debug
        console.log('Product found:', productData)

        // Chuẩn bị dữ liệu sản phẩm để thêm vào giỏ hàng
        const cartProduct = {
            productId: product.productId,
            shopId: productData.product_shop,
            quantity: requestQuantity,
            name: productData.product_name,
            price: productData.product_price,
            thumb: productData.product_thumb || ''
        }

        // Cập nhật số lượng sản phẩm trong database
        await updateProductQuantity({
            productId: product.productId,
            quantity: requestQuantity
        });

        // Kiểm tra giỏ hàng của user
        if (!userCart) {
            // Tạo giỏ hàng mới
            return await cartModel.create({
                userId,
                products: [cartProduct],
                modifiedOn: new Date()
            })
        }

        // Giỏ hàng đã tồn tại, kiểm tra sản phẩm đã có trong giỏ chưa
        const existingProductIndex = userCart.products.findIndex(p => 
            p.productId.toString() === product.productId.toString()
        )

        if (existingProductIndex !== -1) {
            // Sản phẩm đã tồn tại, cập nhật số lượng
            userCart.products[existingProductIndex].quantity += requestQuantity
        } else {
            // Thêm sản phẩm mới vào giỏ
            userCart.products.push(cartProduct)
        }

        userCart.modifiedOn = new Date()
        return await userCart.save()
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    static async updateQuantity({ userId, productId, quantity }) {
        if (quantity <= 0) {
            throw new BadRequestError('Quantity must be greater than 0')
        }

        // Kiểm tra sản phẩm có tồn tại và đã publish chưa
        const productData = await findProduct({ product_id: productId, unSelect: [] })
        if (!productData) {
            throw new NotFoundError('Product not found')
        }

        if (!productData.isPublished) {
            throw new BadRequestError('Cannot update quantity for unpublished product')
        }

        // Kiểm tra số lượng trong kho
        const stockCheck = await checkProductStock({ 
            productId, 
            quantity 
        });

        if (!stockCheck.isEnough) {
            // Trả về mã lỗi cụ thể dựa trên status code
            if (stockCheck.statusCode === 'OUT_OF_STOCK') {
                throw new BadRequestError('Sản phẩm đã hết');
            } else if (stockCheck.statusCode === 'NOT_FOUND_INVENTORY') {
                throw new BadRequestError('Sản phẩm không tồn tại trong kho');
            } else {
                throw new BadRequestError(stockCheck.message);
            }
        }

        // Lấy thông tin giỏ hàng hiện tại để tính toán thay đổi số lượng
        const currentCart = await cartModel.findOne({ 
            userId, 
            'products.productId': productId 
        });
        
        if (!currentCart) {
            throw new NotFoundError('Product not found in cart');
        }
        
        const currentItem = currentCart.products.find(p => 
            p.productId.toString() === productId.toString()
        );
        
        if (!currentItem) {
            throw new NotFoundError('Product not found in cart');
        }
        
        // Tính toán thay đổi số lượng
        const quantityDifference = quantity - currentItem.quantity;
        
        // Nếu có thay đổi số lượng, cập nhật số lượng sản phẩm trong database
        if (quantityDifference !== 0) {
            await updateProductQuantity({
                productId,
                quantity: quantityDifference
            });
        }

        const query = {
            userId,
            'products.productId': productId
        }
        const updateSet = {
            $set: {
                'products.$.quantity': quantity,
                modifiedOn: new Date()
            }
        }

        const result = await cartModel.findOneAndUpdate(query, updateSet, { new: true })
        if (!result) {
            throw new NotFoundError('Product not found in cart')
        }

        return result
    }

    // Xóa sản phẩm khỏi giỏ hàng
    static async removeFromCart({ userId, productId }) {
        // Lấy thông tin giỏ hàng hiện tại để trả lại số lượng vào kho
        const currentCart = await cartModel.findOne({ 
            userId, 
            'products.productId': productId 
        });
        
        if (currentCart) {
            const currentItem = currentCart.products.find(p => 
                p.productId.toString() === productId.toString()
            );
            
            if (currentItem) {
                // Trả lại số lượng sản phẩm vào kho
                await updateProductQuantity({
                    productId,
                    quantity: -currentItem.quantity // Số âm để tăng quantity trong kho
                });
            }
        }

        const query = { userId }
        const updateSet = {
            $pull: {
                products: { productId }
            },
            $set: { modifiedOn: new Date() }
        }

        const result = await cartModel.findOneAndUpdate(query, updateSet, { new: true })
        if (!result) {
            throw new NotFoundError('Cart not found')
        }

        return result
    }

    // Lấy giỏ hàng của user
    static async getCart({ userId }) {
        const cart = await cartModel.findOne({ userId }).lean()
        
        if (!cart) {
            return null
        }
        
        // Lấy thêm product_attributes cho mỗi sản phẩm trong giỏ hàng
        const productIds = cart.products.map(p => p.productId)
        const productsWithAttributes = await product
            .find({ 
                _id: { $in: productIds },
                isPublished: true // Chỉ lấy sản phẩm đã publish
            })
            .select('_id product_attributes isPublished')
            .lean()
        
        // Tạo map để dễ dàng truy cập product_attributes và trạng thái publish
        const productMap = {}
        productsWithAttributes.forEach(p => {
            productMap[p._id.toString()] = {
                product_attributes: p.product_attributes,
                isPublished: p.isPublished
            }
        })
        
        // Lọc ra chỉ sản phẩm đã publish
        cart.products = cart.products
            .filter(p => {
                const productId = p.productId.toString()
                return productMap[productId] && productMap[productId].isPublished
            })
            .map(p => {
                const productId = p.productId.toString()
                return {
                    ...p,
                    product_attributes: productMap[productId]?.product_attributes || {}
                }
            })
        
        return cart
    }

    // Thực hiện thanh toán giỏ hàng
    static async checkout({ 
        userId, 
        productIds = [],
        customerInfo = {}, // Thông tin khách hàng bổ sung
        paymentMethod = 'cod' // Mặc định là thanh toán khi nhận hàng
    }) {
        // Lấy giỏ hàng hiện tại
        const userCart = await cartModel.findOne({ userId });
        if (!userCart || userCart.products.length === 0) {
            throw new BadRequestError('Cart is empty');
        }

        // Lấy thông tin người dùng từ database
        const userInfo = await shopModel.findById(userId);
        if (!userInfo) {
            throw new NotFoundError('User not found');
        }

        // Kết hợp thông tin từ database và thông tin được cung cấp
        const shippingInfo = {
            name: customerInfo.name || userInfo.name || 'Khách hàng',
            email: customerInfo.email || userInfo.email || '',
            phone: customerInfo.phone || '',
            address: customerInfo.address || '',
            city: customerInfo.city || '',
            zipCode: customerInfo.zipCode || '',
            note: customerInfo.note || ''
        };

        // DEBUG: Kiểm tra thông tin giao hàng
        debugCheckout(shippingInfo);

        // Xác định sản phẩm cần thanh toán
        let productsToCheckout = [];
        
        // Nếu có danh sách productIds, chỉ thanh toán những sản phẩm trong danh sách
        if (productIds && productIds.length > 0) {
            // Chuyển đổi productIds thành các string để dễ so sánh
            const productIdStrings = productIds.map(id => id.toString());
            
            // Lọc sản phẩm cần thanh toán từ giỏ hàng
            productsToCheckout = userCart.products.filter(item => 
                productIdStrings.includes(item.productId.toString())
            );
            
            if (productsToCheckout.length === 0) {
                throw new BadRequestError('Không tìm thấy sản phẩm nào để thanh toán');
            }
        } else {
            // Nếu không có danh sách cụ thể, thanh toán toàn bộ giỏ hàng
            productsToCheckout = userCart.products;
        }

        // Kiểm tra số lượng trong kho cho tất cả sản phẩm cần thanh toán
        for (const item of productsToCheckout) {
            const stockCheck = await checkProductStock({
                productId: item.productId,
                quantity: item.quantity
            });

            if (!stockCheck.isEnough) {
                // Trả về mã lỗi cụ thể dựa trên status code
                if (stockCheck.statusCode === 'OUT_OF_STOCK') {
                    throw new BadRequestError(`Sản phẩm ${item.name} đã hết`);
                } else if (stockCheck.statusCode === 'NOT_FOUND_INVENTORY') {
                    throw new BadRequestError(`Sản phẩm ${item.name} không tồn tại trong kho`);
                } else {
                    throw new BadRequestError(`Sản phẩm ${item.name}: ${stockCheck.message}`);
                }
            }
        }

        // Giảm số lượng trong kho cho sản phẩm cần thanh toán
        for (const item of productsToCheckout) {
            await reduceProductStock({
                productId: item.productId,
                quantity: item.quantity
            });
        }

        // Tính tổng tiền đơn hàng
        const totalAmount = productsToCheckout.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Tạo đơn hàng mới
        const newOrder = await createOrder({
            userId,
            products: productsToCheckout,
            totalAmount,
            shippingInfo,
            paymentMethod
        });

        // Gửi email xác nhận đơn hàng
        console.log("Kiểm tra email trước khi gửi:", shippingInfo.email);
        if (shippingInfo.email) {
            try {
                console.log("Bắt đầu quá trình gửi email...");
                const emailTemplate = generateOrderConfirmationEmail({
                    customerName: shippingInfo.name,
                    orderItems: productsToCheckout,
                    totalAmount: totalAmount,
                    shippingInfo,
                    orderId: newOrder._id
                });

                // Sử dụng hàm debug thay vì hàm gửi email chính
                const emailResult = await debugEmail({
                    to: shippingInfo.email,
                    subject: 'Xác nhận đơn hàng của bạn',
                    html: emailTemplate
                });

                console.log('Email sending result:', emailResult);
            } catch (error) {
                console.error("LỖI khi gửi email:", error);
            }
        } else {
            console.log("Không tìm thấy email trong thông tin giao hàng!");
        }

        // Xóa sản phẩm đã thanh toán khỏi giỏ hàng
        const productIdsToRemove = productsToCheckout.map(item => item.productId);
        
        await cartModel.findOneAndUpdate(
            { userId },
            { 
                $pull: { 
                    products: { 
                        productId: { $in: productIdsToRemove } 
                    } 
                },
                $set: { modifiedOn: new Date() }
            }
        );

        return { 
            success: true, 
            message: 'Checkout completed successfully',
            orderInfo: {
                orderId: newOrder._id,
                totalAmount,
                itemCount: productsToCheckout.length,
                shippingInfo
            },
            emailSent: shippingInfo.email ? true : false 
        };
    }
}

module.exports = CartService;