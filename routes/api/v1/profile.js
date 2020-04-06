import express from 'express';
import auth from '../../authJwt';
import { IsAdminUser } from '../../../utils/UsersUtils';
import mongoose from 'mongoose';
const router = express.Router();

const User = mongoose.model('User');
const Resource = mongoose.model('Resource');
const List_resource = mongoose.model('List_resource');
const Profile = mongoose.model('Profile');

// ADMIN ACTUALIZA USUARIO
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

// ACTUALIZAR USUARIO ACTUAL
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

// ADMIN ELIMINA USUARIO
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

// ELIMINAR USUARIO ACTUAL
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

// ADMIN LISTADO VISTO
router.get('/nickname/:nickname/viewed', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.findOne({ nickname: req.params.nickname })
            .populate({
                path: 'profile',
                populate: {
                    path: 'viewed_content',
                    populate: {
                        path: 'resource',
                        populate: 'type',
                        select: ['title', 'slug', 'type', 'releasedAt'],
                    }
                }
            });

        if (!user) {
            return res.sendStatus(404);
        }

        var viewed_content = user.profile.viewed_content;
        res.send({ viewed_content })
    } catch (e) {
        next(e);
    }
})

// LISTADO VISTO USUARIO ACTUAL
router.get('/me/viewed', auth.required, async (req, res, next) => {
    try {
        // TODO PAGINATE
        var user = await User.findById(req.payload.id)
            .populate({
                path: 'profile',
                populate: {
                    path: 'viewed_content',
                    populate: {
                        path: 'resource',
                        populate: 'type',
                        select: ['title', 'slug', 'type', 'releasedAt'],
                    }
                }
            });
        var profile = user.profile;
        var viewed_content = profile.viewed_content;

        return res.send({ viewed_content });
    } catch (e) {
        next(e);
    }
});

// AÑADIR VISTO USUARIO ACTUAL
router.post('/me/viewed', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource || !req.body.resource.slug) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id)
            .populate({
                path: 'profile',
                populate: {
                    path: 'viewed_content',
                    populate: {
                        path: 'resource',
                        populate: 'type',
                        select: ['title', 'slug', 'type', 'releasedAt'],
                    }
                }
            });

        var resource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!resource) {
            return res.sendStatus(404);
        }

        var profile = user.profile;
        var viewed = profile.isViewed(resource);

        var viewed_content = profile.viewed_content;

        if (!viewed) {
            console.log('viewed_content', viewed_content);
            // console.log('find', find);

            var list_resource = new List_resource();
            list_resource.resource = resource;
            await list_resource.save();

            viewed_content.push(list_resource);

            await profile.save();
        } else {
            console.log('Was already seen');
        }

        return res.send({ viewed_content });
    } catch (e) {
        next(e);
    }
});

// ADMIN AÑADE VISTO
router.post('/nickname/:nickname/viewed', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.findOne({ nickname: req.params.nickname })
            .populate({
                path: 'profile',
                populate: {
                    path: 'viewed_content',
                    populate: {
                        path: 'resource',
                        populate: 'type',
                        select: ['title', 'slug', 'type', 'releasedAt'],
                    }
                }
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        var resource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        var profile = user.profile;
        var viewed = profile.isViewed(resource);

        var viewed_content = profile.viewed_content;
        if (!viewed) {

            var list_resource = new List_resource();
            list_resource.resource = resource;
            await list_resource.save();

            viewed_content.push(list_resource);

            await profile.save();
        } else {
            console.log('Was already seen');
        }

        return res.send({ viewed_content });
    } catch (e) {
        next(e);
    }
});

// ELIMINAR VISTO USUARIO ACTUAL
router.delete('/me/viewed', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource || !req.body.resource.slug) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id).populate({
            path: 'profile',
            populate: {
                path: 'viewed_content',
            }
        });
        var profile = user.profile;

        // TODO: REUTILIZABLE
        var selectedResource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!selectedResource) {
            return res.sendStatus(404);
        }

        var viewed_content = profile.viewed_content;

        var selectedViewed = viewed_content.find(element => element.resource._id.toString() === selectedResource._id.toString());

        var tmpProfile;
        if (selectedViewed) {
            tmpProfile = await Profile.findOneAndUpdate(
                { _id: profile._id }, {
                "$pull": {
                    "viewed_content": selectedViewed._id
                }
            },
                { new: true }
            );

            await selectedViewed.remove();
            await profile.save();
        } else {
            console.log('Was not seen');
        }

        if (tmpProfile) {
            viewed_content = tmpProfile.viewed_content;
        }

        return res.send({ viewed_content }); // FIXME : viewed_content No se actualiza al ser borrado
    } catch (e) {
        next(e);
    }
});


// ADMIN ELIMINA VISTO
router.delete('/nickname/:nickname/viewed', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var user = await User.findOne({ nickname: req.params.nickname })
            .populate({
                path: 'profile',
                populate: {
                    path: 'viewed_content',
                    populate: 'type',
                    select: ['title', 'slug', 'type', 'releasedAt'],
                }
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        var selectedResource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!selectedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        var profile = user.profile;
        var viewed_content = profile.viewed_content;

        var selectedViewed = viewed_content.find(element => element.resource._id.toString() === selectedResource._id.toString());

        if (selectedViewed) {
            await Profile.updateOne(
                { _id: profile._id }, {
                "$pull": {
                    "viewed_content": selectedViewed._id
                }
            });

            await selectedViewed.remove();
            await profile.save();
        } else {
            console.log('Was not seen');
        }

        return res.send({ viewed_content })
    } catch (e) {
        next(e);
    }
});

// PROFILE DE UN USUARIO
router.get('/get/:nickname', async (req, res, next) => {
    try {
        var user = await User.findOne({ nickname: req.params.nickname }).populate({
            path: 'profile'
        });

        var profile = user.profile;
        return res.send({ profile: profile.toDetailsJSON() });
    } catch (e) {
        next(e);
    }
})

export default router;