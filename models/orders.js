const mongoose = require('mongoose');
const Joi = require('joi');
const Schema = mongoose.Schema;

/* A common gotcha for beginners is that the unique option for schemas is not a validator.
It's a convenient helper for building MongoDB unique indexes. */
const orderSchema = mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    product: [{
        productId: { type: Schema.Types.ObjectId, ref: 'products' },
        quantity: {type: Number},
    }],
    
    status: {
        type: String,
        required: true,
    },
    createdAt: {type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now }
})



exports.Order = mongoose.model('Order', orderSchema);


