import express from 'express';
import auth from '../../authJwt';
import mongoose from 'mongoose';
const router = express.Router();

const User = mongoose.model('User');
const List = mongoose.model('List');
const Resource = mongoose.model('Resource');
const List_resource = mongoose.model('List_resource');

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
        list.owner = profile;
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

// LISTAS DEL USUARIO LOGUEADO
router.get('/me', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id, { profile: 1 }).populate({
            path: 'profile',
            populate: {
                path: 'lists',
                select: '-_id -owner -content -createdAt -updatedAt'
            }
        });

        var profile = user.profile;
        var lists = profile.lists;

        return res.send({ lists });
    } catch (e) {
        next(e);
    }
});

// DEVOLVER LISTADO POR SLUG
router.get('/get/:slug', auth.optional, async (req, res, next) => {
    try {
        // ADMIN -> ENVIAR LISTADO
        // GUEST -> ENVIAR LISTADO SOLO SI ES PÚBLICO
        // USER  -> ENVIAR LISTADO SI ES PÚBLICO O ES SUYO

        var list = await List.findOne({ slug: req.params.slug })
            .populate({
                path: 'content',
                populate: {
                    path: 'resource',
                    select: 'slug title releasedAt',
                    populate: {
                        path: 'type',
                        select: 'name'
                    }
                }
            })
            .populate({
                path: 'owner',
                select: 'owner',
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            });

        if (!list) {
            return res.sendStatus(404);
        }

        if (!list.isPrivate()) {
            // Es público
            return res.send({ list });
        } else if (req.payload) {
            // Usuario logueado
            var user = await User.findById(req.payload.id)
                .populate('type')
                .populate({
                    path: 'profile',
                });

            if (user.type && user.type.name === 'Admin') {
                // Admin -> Devolver listado
                return res.send({ list });
            }

            // DEVOLVER SI ES DEL USUARIO LOGUADO
            if (list.owner._id.toString() == user.profile._id.toString()) {
                console.log(list);
                return res.send({ list })
            }


            return res.sendStatus(403);
        } else {
            // Listado privado sin usuario logueado
            return res.sendStatus(403);
        }
    } catch (e) {
        next(e);
    }
});

// AÑADIR A LISTA
router.post('/add/:slug', auth.required, async (req, res, next) => {
    try {
        // AÑADIR SI owner O ADMIN 
        if (!req.body.resource || !req.body.resource.slug) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id, {profile: 1, owner:1, type: 1})
            .populate('type')
            .populate({
                path: 'profile',
                select: 'lists',
                // populate: {
                //     path: 'lists',
                // }
            });

        // Buscar listado
        var list = await List.findOne({ slug: req.params.slug })
            // .populate({
            //     path: 'owner'
            // })
            .populate({
                path: 'content',
                populate: {
                    path: 'resource',
                    // select: '_id'
                }
            });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Buscar recurso
        var resource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        var profile = user.profile;

        // Comprobar si es usuario admin o es del usuario logueado
        if(!user.type || user.type.name !== 'Admin') {
            var userLists = profile.lists;
            // console.log('userLists', userLists);

            var result = userLists.findIndex(currentList => {
                return currentList.toString() === list._id.toString()
            });
            
            if (result === -1) { 
                // Esa lista no es del usuario logueado
                return res.sendStatus(403);
            }
        } 

        var actualContent = list.content;

        // Comprobar si ya estaba en la lista
        var exists = actualContent.find(listResource => listResource.resource._id.toString() == resource._id.toString());
        if (!exists) {
            // Añadir si no estaba
            var listResource = new List_resource();
            listResource.resource = resource;
            listResource.save();

            actualContent.push(listResource);

            list.save();
        } else {
            console.log('Was already on the list');
        }

        return res.send(actualContent);
    } catch (e) {
        next(e);
    }
});

// ELIMINAR DE LISTA
router.delete('/remove/:slug', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource.slug) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id)
            .populate('type')
            .populate({
                path: 'profile',
            });

        console.log(user);

        // TODO : REMOVE FROM LIST

    } catch (e) {
        next(e);
    }
});



export default router;