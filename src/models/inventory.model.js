'use-strict'

const { model, Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

const inventorySchema = new Schema({
    inven_productId: {type: Schema.Types.ObjectId, ref:'Product'},
    inven_location: {type: String, default:'unKnow'},
    inven_stock:{type:Number, require: true},
    inven_shopId:{type:Schema.Types.ObjectId, ref:'Shop'},
    inven_reservations: {type: Array, default:{}}
},{
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema)
}
