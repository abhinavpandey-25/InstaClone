//place all the routes at this place so that app will not be bulky
const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config/keys')
require('../models/user')
const router = express.Router();
const mongoose = require('mongoose')
const User = mongoose.model("User")
router.get('/', (req, res) => {
    res.send("hi bro")
})
const requireLogin = require('../middleware/requiredLogin')
router.get('/protected', requireLogin, (req, res) => {
    //here we used a middle that veify the user and if verified then
    //only he wiil have the access to the protected resource
    res.send("heelo middle wawre")
})
//lets tests for a route  by paasing the token in authorization  header so that user can only access if he is logged in
//also for that we need to verify the token given to the user using a middleware

//inbuilt in express to recognize the incoming Request Object as a JSON Object.
router.post('/signup', (req, res) => {
    //  console.log(req.body)
    const { name, password, email, url } = req.body;
    if (!name || !password || !email) {
        //422 means that server understand the request but cannot process
        res.status(422).send({ error: "please add all fields" })
    }
    else {
        User.findOne({ email: email }).then((user) => {
            console.log(user)
            if (user) {
                res.status(422).send({ error: "User already exist with that mail id" })
            }
            else {
                bcrypt.hash(password, 12).then(encryptpswd => {
                    const newuser = new User({
                        name: name,
                        password: encryptpswd,
                        email: email,
                        url
                    })
                    newuser.save((err, result) => {
                        if (!err) {
                            res.status(201).send({ message: "user successfully signed up" })
                        }
                    })
                })
            }
        });


        //201 means request succesfuly fullfilled
    }
})
router.post('/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(422).send({ error: "please provide email or password" })
    }
    else {
        User.findOne({ email: email }).then(savedUser => {
            if (!savedUser) {
                return res.status(422).send({ error: "email or password do not match" })
            }
            else {
                console.log(savedUser)
                bcrypt.compare(password, savedUser.password).then(result => {
                    if (result) {
                        const token = jwt.sign({ user_id: savedUser._id }, SECRET_KEY)
                        const { _id, name, email, followers, following, url } = savedUser
                        return res.send({ token, user: { _id, name, email, followers, following, url } })
                    }
                    else {
                        return res.status(422).send({ error: "email or password do not match" })
                    }
                })
                    .catch(err => {
                        console.log(err);
                    })
            }
        }).catch(err => {
            console.log(err)
        })
    }
})
module.exports = router