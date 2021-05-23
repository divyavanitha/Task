const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

/* A common gotcha for beginners is that the unique option for schemas is not a validator.
It's a convenient helper for building MongoDB unique indexes. */
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    },
   
    createdAt: {type: Date, default: Date.now },
    updatedAt: {type: Date, default: Date.now }
})



exports.Product = mongoose.model('Product', productSchema);


