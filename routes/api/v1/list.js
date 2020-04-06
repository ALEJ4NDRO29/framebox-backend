import express from 'express';
import auth from '../../authJwt';
import mongoose from 'mongoose';
const router = express.Router();

const User = mongoose.model('User');
const List = mongoose.model('List');

// CREATE LIST CURRENT USER
router.post('/me', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id).populate({
            path: 'profile'
        });

        var profile = user.profile;

        if (!req.body.list || !req.body.list.name) {
            return res.sendStatus(400);
        }

        var list = new List();
        list.name = req.body.list.name;
        list.description = req.body.list.description;
        list.private = req.body.list.private;
        await list.save();

        profile.lists.push(list);
        await profile.save();

        return res.status(201).send({ list });
    } catch (e) {
        next(e);
    }
});

router.get('/get/:slug', auth.optional, async (req, res, next) => {
    try {
        // ADMIN -> ENVIAR LISTADO
        // GUEST -> ENVIAR LISTADO SOLO SI ES PÚBLICO
        // USER  -> ENVIAR LISTADO SI ES PÚBLICO O ES SUYO

        var list = await List.findOne({ slug: req.params.slug }).populate({
            path: 'content',
            populate: {
                path: 'resource'
            }
        });

        if (!list.isPrivate()) {
            // Es público
            return res.send({ list });
        } else if (req.payload) {
            // Usuario logueado
            var user = await User.findById(req.payload.id)
                .populate('type')
                .populate({
                    path: 'profile',
                    populate: {
                        path: 'lists'
                    }
                });

            console.log(user);
            return res.send(user);
        } else {
            // Listado privado sin usuario logueado
            return res.sendStatus(403);
        }
    } catch (e) {
        next(e);
    }
})

export default router;