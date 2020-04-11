import express from 'express';
import mongoose from 'mongoose';
import auth from "../../authJwt";
const router = express.Router();

const User = mongoose.model('User');
const Resource = mongoose.model('Resource');
const Review = mongoose.model('Review');

// TODO : STATS

// CREATE
router.post('/', auth.required, async (req, res, next) => {
    try {
        if (!req.body.review ||
            !req.body.review.resource ||
            req.body.review.rate === undefined ||
            req.body.review.rate < 0 ||
            req.body.review.rate > 10) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id, { profile: 1 }).populate({
            path: 'profile',
            select: '_id owner',
            populate: {
                path: 'owner',
                select: 'nickname'
            }
        });
        var profile = user.profile;

        var resource = await Resource.findOne({ slug: req.body.review.resource }, { description: 0 }).populate({
            path: 'type',
            select: 'name'
        });
        if (!resource) {
            return res.sendStatus(404);
        }

        var review = await Review.findOne({ resource, profile })
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'resource',
                select: '-description'
            });


        if (!review) {
            review = new Review();
        } else {
            console.log('Review exists, update');
        }
        review.profile = profile;
        review.resource = resource;
        review.rate = req.body.review.rate;
        review.review = req.body.review.review;

        await review.save();
        return res.send({ review });
    } catch (e) {
        next(e);
    }
});

// UPDATE REVIEW
router.put('/id/:id', auth.required, async (req, res, next) => {
    try {
        if (!req.body.review ||
            req.body.review.rate === undefined ||
            req.body.review.rate < 0 ||
            req.body.review.rate > 10) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id)
            .populate({
                path: 'type',
                select: 'name'
            })
            .populate({
                path: 'profile',
                select: '_id'
            });

        var review = await Review.findById(req.params.id)
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            }).populate({
                path: 'resource',
                select: '-description'
            });

        if (!review) {
            return res.sendStatus(404);
        }

        var reviewProfileId = review.profile._id.toString();
        var userProfileId = user.profile._id.toString();

        if ((user.type && user.type.name === 'Admin') || (reviewProfileId === userProfileId)) {
            review.rate = req.body.review.rate;
            review.review = req.body.review.review;

            await review.save();
            return res.send({ review });
        } else {
            return res.sendStatus(403);
        }
    } catch (e) {
        next(e);
    }
});

// REMOVE REVIEW
router.delete('/id/:id', auth.required, async (req, res, next) => {
    try {
        var review = await Review.findById(req.params.id)
            .populate({
                path: 'profile',
                select: '_id'
            });

        if (!review) {
            return res.sendStatus(404);
        }

        var user = await User.findById(req.payload.id)
            .populate({
                path: 'type',
                select: 'name'
            }).populate({
                path: 'profile',
                select: '_id'
            });

        if (user.type && user.type.name === 'Admin') {
            await review.remove();
        }

        var currentProfileId = user.profile._id.toString();
        var reviewProfileId = review.profile._id.toString();

        if (currentProfileId === reviewProfileId) {
            await review.remove();
        } else {
            return res.sendStatus(403);
        }

        return res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

// GET ME REVIEW BY RESOURCE
router.get('/me/resource/:slug', auth.required, async (req, res, next) => {
    try {
        var resource = await Resource.findOne({ slug: req.params.slug });

        if (!resource) {
            return res.sendStatus(404);
        }

        var user = await User.findById(req.payload.id)
            .populate({
                path: 'profile',
                select: '_id owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            });

        var profile = user.profile;

        var review = await Review.findOne({ resource, profile })
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'resource',
                select: '-description'
            });

        return res.send({ review });
    } catch (e) {
        next(e);
    }
});

// GET BY RESOURCE (LIST)
router.get('/resource/:slug', async (req, res, next) => {
    try {
        var resource = await Resource.findOne({ slug: req.params.slug }, { _id: 1 });
        if (!resource) {
            return res.sendStatus(404);
        }

        var reviews = await Review.find({ resource: resource })
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'resource',
                select: '-description',
                populate: {
                    path: 'type',
                    select: 'name'
                }
            });

        return res.send({ reviews });
    } catch (e) {
        next(e);
    }
})

// GET BY ID
router.get('/id/:id', async (req, res, next) => {
    try {
        var review = await Review.findById(req.params.id)
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'resource',
                select: '-description',
                populate: {
                    path: 'type',
                    select: 'name'
                }
            });
        return res.send({ review });
    } catch (e) {
        next(e);
    }
});

// GET MY REVIEWS
router.get('/me', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id).populate({
            path: 'profile'
        });

        var profile = user.profile;

        var reviews = await Review.find({ profile: profile })
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'resource',
                select: '-description',
                populate: {
                    path: 'type',
                    select: 'name'
                }
            });

        return res.send({ reviews });
    } catch (e) {
        next(e);
    }
});

export default router;