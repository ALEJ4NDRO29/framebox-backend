import express from 'express';
import auth from '../../authJwt';
import { IsAdminUser } from '../../../utils/UsersUtils';
import { sendThanksSuggestion } from '../../../utils/EmailUtils';
import { Suggestion_state, Suggestion, User, Resource_type } from '../../../models';
const router = express.Router();

// POSIBLE STATES
router.get('/states', async (req, res, next) => {
    try {
        var states = await Suggestion_state.find({}, { name: 1 });
        return res.send({ states });
    } catch (e) {
        next(e);
    }
});

// AÑADIR SUGERENCIA
router.post('/add', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource || !req.body.resource.title) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id, { nickname: 1, email: 1, profile: 1 })
            .populate({
                path: 'type',
                select: 'name'
            })
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                },
                option: {
                    limit: 4
                }
            });
        var profile = user.profile;

        var type = await Resource_type.findOne({ name: req.body.resource.type });
        if (!type) {
            return res.status(404).json({ error: 'Type not found' });
        }

        var state = await Suggestion_state.findOne({ name: 'Received' });
        if (!state) {
            return res.send(500);
        }

        var suggestion = new Suggestion();
        suggestion.state = state;
        suggestion.profile = profile;
        suggestion.title = req.body.resource.title;
        suggestion.type = type;
        suggestion.description = req.body.resource.description;
        suggestion.imageUrl = req.body.resource.imageUrl;
        suggestion.company = req.body.resource.company;

        await suggestion.save();
        if (!user.type || user.type.name !== 'Admin') {
            sendThanksSuggestion(user.email, user.nickname, req.body.resource.title);
        }

        return res.send({ suggestion });
    } catch (e) {
        next(e);
    }
});

// TODO : FILTER
// LISTADO DE SUGERENCIAS
router.get('/', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id, { type: 1, profile: 1 }).populate({
            path: 'type',
            select: 'name'
        });

        var filter = {};
        if (user.type && user.type.name === 'Admin') {
            // Acceso a todas las sugerencias
            console.log('Admin');
        } else {
            // Acceso a sus sugerencias
            console.log('User');
            filter = { profile: user.profile }
        }

        var suggestions = await Suggestion.paginate(filter, {
            limit: req.query.limit || 10,
            page: req.query.page || 1,
            sort: req.query.orderBy || '-createdAt',
            populate: {
                path: 'state profile',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            }
        })
        
        return res.send(suggestions);
    } catch (e) {
        next(e);
    }
});

// OBTENER SUGERENCIA POR SLUG
router.get('/slug/:slug', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id).populate({
            path: 'type',
            select: 'name'
        });

        var suggestion = await Suggestion.findOne({ slug: req.params.slug })
            .populate({
                path: 'state',
                select: 'name'
            })
            .populate({
                path: 'profile',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            });

        if (user.type && user.type.name === 'Admin') {
            return res.send({ suggestion });
        }

        var suggestionProfileId = suggestion.profile._id.toString();
        var userProfileId = user.profile.toString();

        if (suggestionProfileId === userProfileId) {
            return res.send({ suggestion })
        }

        return res.sendStatus(403);
    } catch (e) {
        next(e);
    }
});

// ELIMINAR SUGERENCIA
router.delete('/slug/:slug', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id, { type: 1, profile: 1 })
            .populate({
                path: 'type',
                select: 'name'
            });

        var suggestion = await Suggestion.findOne({ slug: req.params.slug }, { profile: 1 });

        if (!suggestion) {
            return res.sendStatus(404);
        }

        var userProfileId = user.profile.toString();
        var suggestionProfileId = suggestion.profile.toString();

        if (
            (user.type && user.type.name === 'Admin') ||
            (userProfileId === suggestionProfileId)) {
            await suggestion.remove();
            return res.sendStatus(200);
        }

        return res.sendStatus(403);
    } catch (e) {
        next(e);
    }
});

// ACTUALIZAR STATE A SUGERENCIA
router.put('/state/:slug', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id)) {
            return res.sendStatus(403);
        }

        if (!req.body.type || !req.body.type.name) {
            return res.sendStatus(400);
        }

        var state = await Suggestion_state.findOne({ name: req.body.type.name });
        if (!state) {
            return res.status(404).send({ error: 'State not found' });
        }

        var suggestion = await Suggestion.findOne({ slug: req.params.slug })
            .populate({
                path: 'state'
            });

        if (!suggestion) {
            return res.status(404).send({ error: 'Suggestion not found' });
        }

        suggestion.state = state;
        await suggestion.save();
        return res.send({ suggestion })
    } catch (e) {
        next(e);
    }
});

export default router;