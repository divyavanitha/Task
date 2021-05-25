const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mongodb = require("mongodb").MongoClient;
let url = "mongodb://localhost:27017/";
const {Product, validate} = require('../models/product');
const Joi = require('joi');
const path = require('path');
const {auth, upload} = require("../middleware/auth");
const ObjectId = require('mongodb').ObjectID;
var moment = require('moment'); 
const fs = require('fs');
var parse = require('csv-parse');

router.post('/upload', [ upload( path.join(__dirname, '../upload/files/') ).fields([{ name: 'file', maxCount: 1 }]) ],  async (req, res) => {

    var csvData=[];
    let stream = fs.createReadStream(req.files.file[0].path)
    .pipe(parse({delimiter: ':'}))
    .on('data', function(csvrow) {

        let data = csvrow.toString();

        let val = data.split(',');
            csvData.push({
              name: val[0],
              price: val[1],
              status: true,
              createdAt: Date.now()
            }); 

        })
        .on('end',function() {
          csvData.shift();

    });

    console.log(csvData);

    mongodb.connect(
          url,
          { useNewUrlParser: true, useUnifiedTopology: true },
          (err, client) => {
            if (err) throw err;

            client
              .db("Task")
              .collection("products")
              .insertMany(csvData, (err, res) => {
                if (err) throw err;

                console.log(`Inserted: ${res.insertedCount} rows`);
                client.close();
              });
          }
        );

    res.send("Successfully Inserted");

});



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
