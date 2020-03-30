const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const User = mongoose.model('User');

router.post('/register', (req, res) => {
    console.log(User);

    var user = new User();

    user.nickname = req.body.nickname;
    user.email = req.body.email;

    user.save();
    
    return res.send(user)
})

router.post('/login', (req, res) => {
    // TODO: LOGIN
    // return res.send(req.body.user)
})

module.exports = router;
