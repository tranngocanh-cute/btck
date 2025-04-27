'use strict'
const {
    inventory
} = require('../inventory.model')

const {Types} = require('mongoose')

const insertInventory = async({
    productId, shopId , stock, location = 'unKnow'
}) => {{
    return await inventory.create({
        inven_productId:productId,
        inven_stock:stock,
        inven_shopId:shopId,
        inven_location:location

    })
}}

// Kiểm tra số lượng sản phẩm trong kho
const checkProductStock = async ({ productId, quantity }) => {
    const inventoryItem = await inventory.findOne({
        inven_productId: new Types.ObjectId(productId)
    }).lean();

    if (!inventoryItem) {
        return {
            isEnough: false,
            availableStock: 0,
            statusCode: 'NOT_FOUND_INVENTORY',
            message: 'Sản phẩm không tồn tại trong kho'
        };
    }

    // Kiểm tra xem có đủ hàng không
    if (inventoryItem.inven_stock <= 0) {
        return {
            isEnough: false,
            availableStock: 0,
            statusCode: 'OUT_OF_STOCK',
            message: 'Sản phẩm đã hết'
        };
    }

    const available = inventoryItem.inven_stock >= quantity;
    return {
        isEnough: available,
        availableStock: inventoryItem.inven_stock,
        statusCode: available ? 'AVAILABLE' : 'INSUFFICIENT_STOCK',
        message: available ? 'Đủ hàng' : `Hết hàng sản phẩm đã hết`
    };
}

// Giảm số lượng sản phẩm trong kho khi thêm vào giỏ hàng (tuỳ chọn)
const reduceProductStock = async ({ productId, quantity }) => {
    const inventoryItem = await inventory.findOneAndUpdate(
        { inven_productId: new Types.ObjectId(productId) },
        { $inc: { inven_stock: -quantity } },
        { new: true }
    );
    
    return inventoryItem;
}

module.exports = {
    insertInventory,
    checkProductStock,
    reduceProductStock
}