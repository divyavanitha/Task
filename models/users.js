const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

/* A common gotcha for beginners is that the unique option for schemas is not a validator.
It's a convenient helper for building MongoDB unique indexes. */
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
    }
})

userSchema.methods.generateAuthToken = function(payload) {
    const token = jwt.sign(payload, 'secret', {expiresIn: 3600});
    return token;
}

function validate(request) {

    const schema = Joi.object().options({ abortEarly: false }).keys({
        name: Joi.string().min(3).required().label("Name"),
        email: Joi.string().required().label("Email"),
        password: Joi.string().min(6).label("Password"),
        password_confirmation: Joi.any().valid(Joi.ref('password')).required()
    });

    return schema.validate(request);
}

exports.User = mongoose.model('User', userSchema);
exports.validate = validate;