import express from 'express';
import auth from '../../authJwt';
import { IsAdminUser } from '../../../utils/UsersUtils';
import mongoose from 'mongoose';
const router = express.Router();

const User = mongoose.model('User');
const Resource = mongoose.model('Resource');
const List_resource = mongoose.model('List_resource');
// UPDATE / DELETE
// User -> Solo podrá actualizar su perfil
// Admin -> Podrá actualizar todos los perfiles

// DELETE
// Eliminar perfil y ¿usuario?

router.put('/nickname/:nickname', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.find({ nickname: req.params.nickname }).populate('profile');
        if (!user) {
            return res.sendStatus(404);
        }

        var profile = user.profile;

        if (!req.body.profile) {
            return res.sendStatus(400);
        }

        await user.updateProfile(profile, req.body.profile);

        return res.send({ profile });
    } catch (e) {
        next(e);
    }
});

router.put('/me', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id).populate('profile');
        var profile = user.profile;

        if (!req.body.profile) {
            return res.sendStatus(400);
        }

        await user.updateProfile(profile, req.body.profile);

        return res.send({ profile });
    } catch (e) {
        next(e);
    }
});

router.delete('/nickname/:nickname', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.find({ nickname: req.params.nickname }).populate('profile');
        if (!user) {
            return res.sendStatus(404);
        }
        var profile = user.profile;

        await profile.remove();
        await user.remove();
    } catch (e) {
        next(e);
    }
});

router.delete('/me', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id).populate('profile');
        var profile = user.profile;

        await profile.remove();
        await user.remove();

        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.post('/nickname/:nickname/viewed', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.findOne({ nickname: req.params.nickname })
            .populate('profile')
            .populate('viewed_content');

        var profile = user.profile;

        if (!user) {
            return res.sendStatus(404);
        }

        // TODO Add view
        return res.send(profile.viewed_content);
    } catch (e) {
        next(e);
    }
});

router.post('/me/viewed', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource || !req.body.resource.slug) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id)
            .populate('profile')
            .populate('viewed_content');

        var resource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!resource) {
            return res.sendStatus(404);
        }

        var profile = user.profile;
        var viewed_content = profile.viewed_content;

        // console.log(typeof viewed_content);
        
        // var find = await viewed_content.find({ resource: resource });

        console.log('viewed_content', viewed_content);
        // console.log('find', find);

        var list_resource = new List_resource();
        list_resource.resource = resource;
        // await list_resource.save();
        
        viewed_content.push(list_resource);

        // TODO 
        return res.send(profile);
    } catch (e) {
        next(e);
    }
});

export default router;