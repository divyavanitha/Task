const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {User, validate} = require('../models/users');
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {

    try {

        const schema = Joi.object().options({ abortEarly: false }).keys({
            email: Joi.string().required().label("Email"),
            password: Joi.string().required().min(6).label("Password")
        }).unknown(true);

        const { error } = schema.validate(req.body);
       
        const errors = { };
        if (error) {
            for (let err of error.details) {
                errors[err.path[0]] = (err.message).replace(/"/g, "");
            }
        }

        if(error) return res.status(422).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if(!user) res.status(422).send('Invalid email');

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) res.status(422).send('password error');

        let payload = _.pick(user, ['_id', 'name', 'email']);

        const token = user.generateAuthToken(payload);

        const response = {success: true, user: payload, token: token }

        res.send(response);
    } catch(err) {
        console.log(err);
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});



router.post('/register', async (req, res) => {

    try {

        const { error } = validate(req.body);

        if(error) return res.status(422).send(error.details[0].message);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        await user.save();

        let payload = _.pick(user, ['_id', 'name', 'email']);
       
        const token = user.generateAuthToken(payload);

        const response = {success: true, user: payload, token: token }

        res.send(response);
       
    } catch(err) {
        for(i in err.errors) {
            res.status(422).send(err.errors[i].message);
        }
    }

});

module.exports = router;
