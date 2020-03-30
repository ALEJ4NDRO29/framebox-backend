import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const User = mongoose.model('User');

router.post('/register', (req, res) => {
    
    var user = new User();
    
    user.nickname = req.body.user.nickname;
    user.email = req.body.user.email;
    
    // user.save();
    
    console.log(user.nickname);
    return res.send(user)
})

router.post('/login', (req, res) => {
    // TODO: LOGIN
    // return res.send(req.body.user)
})

export default router;
