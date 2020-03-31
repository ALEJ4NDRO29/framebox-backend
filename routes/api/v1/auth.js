import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

import auth from '../../auth';

const router = express.Router();
const User = mongoose.model('User');

router.get('/current', auth.required, (req, res, next) => {
    User.findById(req.payload.id)
        .populate('type')
        .then(user => {
            if (!user) {
                return res.sendStatus(401);
            }

            return res.json({ user: user.toAuthJson() });
        }).catch(next);
});

router.post('/register', async (req, res, next) => {
    try {
        var user = new User();

        user.nickname = req.body.user.nickname;
        user.email = req.body.user.email;

        user.setPassword(req.body.user.password)
        await user.createProfile();
        await user.save()

        res.send({ user: user.toAuthJson() });
    } catch (e) {
        next(e)
    }
})

router.post('/login', (req, res, next) => {
    if (!req.body.user.email || !req.body.user.password) {
        return res.status(400).json({ errors: { "email or password": "is invalid" } });
    }

    passport.authenticate('local', { session: false }, function (err, user, info) {
        if (err) { return next(err); }

        if (user) {
            return res.json({ user: user.toAuthJson() });
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});

export default router;
