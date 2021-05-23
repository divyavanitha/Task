const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Product, validate} = require('../models/product');
const Joi = require('joi');
const auth = require("../middleware/auth");

router.post('/create', auth, async (req, res) => {

    try {

        const schema = Joi.object().options({ abortEarly: false }).keys({
            name: Joi.string().required().label("Name"),
            price: Joi.string().required().label("Price")
        }).unknown(true);

        const { error } = schema.validate(req.body);
       
        const errors = { };
        if (error) {
            for (let err of error.details) {
                errors[err.path[0]] = (err.message).replace(/"/g, "");
            }
        }

       if(error) return res.status(422).send(error.details[0].message);

    
        const product = {
            name: req.body.name,
            price: req.body.price
        }
        let data = await Product.findOneAndUpdate({name: req.body.name}, product, { upsert: true, new: true, setDefaultsOnInsert: true  });

        let response = {success: true, data }

        
        res.send(response);

    } catch(err) {
        console.log(err);
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});



router.get('/list', auth, async (req, res) => {
console.log(req.user);
    try {

        let products = await Product.find();
        const response = {success: true, products }

        res.send(response);
       
    } catch(err) {
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});

module.exports = router;
