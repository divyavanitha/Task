const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Order, validate} = require('../models/orders');
const {Product} = require('../models/product');
const {User} = require('../models/users');
const Joi = require('joi');
const {auth} = require("../middleware/auth");
const ObjectId = require('mongodb').ObjectID;
var moment = require('moment'); 

router.post('/create', auth, async (req, res) => {

     let body = JSON.parse(JSON.stringify(req.body));

     console.log(req.body['product_id[]']);

    try {

        const schema = Joi.object().options({ abortEarly: false }).keys({
            'product_id[]': Joi.array().required().label("Product Id"),
            'quantity[]': Joi.array().required().label("quantity")
        }).unknown(true);

        const { error } = schema.validate(req.body);
       
        const errors = { };
        if (error) {
            for (let err of error.details) {
                errors[err.path[0]] = (err.message).replace(/"/g, "");
            }
        }

       if(error) return res.status(422).send(error.details[0].message);

         const order = new Order({
            userId: req.user._id,   
            status: "PENDING"
        })

         let products = [];

        for(let i in req.body['product_id[]']) {
            console.log(req.body['product_id[]'][i]);
            let data = {
                productId: req.body['product_id[]'][i],
                quantity: req.body['quantity[]'][i]
            }
            products.push(data);
        }

        if(products.length > 0) order.product = products;

        await order.save();

        let response = {success: true, order }
        
        res.send(response);

    } catch(err) {
        console.log(err);
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});



router.patch('/status', auth, async (req, res) => {

    try {

        let order = {
            status : req.body.status
        }

        let orders = await Order.findByIdAndUpdate({_id: req.body.id}, order);

        const response = {success: true, orders }

        res.send(response);
       
    } catch(err) {
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});

router.get('/list', auth, async (req, res) => {

   try {

        let projection = {};
        let sort = {};
        let product;
        let user;
        if(req.query.product){
            product = await Product.findOne({name: req.query.product}, {_id: 1});
            projection['product.productId'] = product._id;
        }

        if(req.query.user){
            user = await User.findOne({name: req.query.user}, {_id: 1});
            projection.userId = user._id;
        }

        if(req.query.sortBy){
            sort[req.query.sortBy] = (req.query.sortOrder && req.query.sortOrder == "asc") ? 1 : -1;
        }

        let orders = await Order.find(projection, null, {sort});
        const response = {success: true, orders }

        res.send(response);
       
    } catch(err) {
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});

router.get('/product/count', async (req, res) => {

    const schema = Joi.object().options({ abortEarly: false }).keys({
        date: Joi.string().required().label("Date")
    }).unknown(true);

    const { error } = schema.validate(req.query);
   
    const errors = { };
    if (error) {
        for (let err of error.details) {
            errors[err.path[0]] = (err.message).replace(/"/g, "");
        }
    }

   if(error) return res.status(422).send(error.details[0].message);

   try {
        var datearray = (req.query.date).split("-");
        var newdate = datearray[2] + '-' + datearray[1] + '-' + datearray[0];
        let lesser = moment(newdate).toISOString();
        let greater = moment( (moment(newdate)).add(1, 'd')).toISOString();
        console.log(  lesser );
        console.log(  greater  );
        let orders =  Order.find({ createdAt: {  $gte: lesser, $lte: greater   } });

        orders.select("_id product createdAt");
        orders.populate({path:"product", select:"_id"});

        let data = await orders;

        let count = 0;

        data.map((list) => {

            count += list.product.length;
        })

        const response = {success: true, totalProducts: count }

        res.send(response);
       
    } catch(err) {
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});


router.get('/customer/list', async (req, res) => {

        try {
            let orders = User.aggregate([
            { "$lookup": {
                "from": "orders",
                "let": { "id": "$_id" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [ "$$id", "$userId" ] } }, },
                    { "$unwind": "$product" },
                    { "$lookup": {
                        "from": "products",
                        "let": { "productId": "$product.productId" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$productId"] }}}
                        ],
                    "as": "products"
                    }},
                ],
                "as": "orders"
                }},
                { $project: {"name":1, "orders": 1,  totalOrders: {$size: "$orders"}}}
            ]);


            let data = await orders;

            const response = {success: true, data }

            res.send(response);
        } catch(err) {
        for(i in err.errors) {
        res.status(422).send(err.errors[i].message);
        }
        }

});

module.exports = router;
