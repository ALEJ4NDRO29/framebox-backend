import express from 'express';
import passport from 'passport';

import auth from '../../authJwt';
import { IsAdminUser } from '../../../utils/UsersUtils';
import { sendWelcome } from '../../../utils/EmailUtils';

import { User, Profile, User_type } from '../../../models';

const router = express.Router();

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
        // await user.createProfile();
        var profile = new Profile();
        profile.owner = user;
        user.profile = profile;
        await user.save();
        await profile.save();

        sendWelcome(req.body.user.email, req.body.user.nickname);

        return res.send({ user: user.toAuthJson() });
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

router.post('/type/set/:nickname', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.findOne({ nickname: req.params.nickname });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        var type = await User_type.findOne({ name: req.body.userType.name });
        if (!type) {
            return res.status(404).json({ error: 'Type not found' });
        }

        user.type = type;
        await user.save();

        return res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.get('/users', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });
        
        var filter = {};
        var q = req.query.q;
        if (q) {
            filter = {
                title: new RegExp(`${q}`, 'i')
            }
        }
        
        var users = await User.paginate(filter, {
            limit: req.query.limit || 10,
            page: req.query.page || 1,
            sort: req.query.orderBy || '-createdAt',
            select: 'nickname type email',
            populate: {
                path: 'type',
                select: 'name'
            }
        });

        return res.send(users);
    } catch (e) {
        next(e);
    }
});

export default router;
