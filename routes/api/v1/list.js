import express from 'express';
import auth from '../../authJwt';
import mongoose from 'mongoose';
const router = express.Router();
import { IsAdminUser } from '../../../utils/UsersUtils';
import { User, List, Profile, Resource, List_resource } from '../../../models';

// const User = mongoose.model('User');
// const List = mongoose.model('List');
// const Profile = mongoose.model('Profile');
// const Resource = mongoose.model('Resource');
// const List_resource = mongoose.model('List_resource');

// ADMIN CREA LISTA A USUARIO
router.post('/create/to/:nickname', auth.required, async (req, res, next) => {
    try {

        if (!await IsAdminUser(req.payload.id)) {
            return res.sendStatus(403);
        }
        if (!req.body.list || !req.body.list.name) {
            return res.sendStatus(400);
        }

        var user = await User.findOne({ nickname: req.params.nickname }, { profile: 1 }).populate({
            path: 'profile',
            populate: {
                path: 'owner',
                select: 'nickname'
            }
        });

        var profile = user.profile;

        var list = new List();
        list.owner = profile;
        list.name = req.body.list.name;
        list.description = req.body.list.description;
        list.private = req.body.list.private;
        await list.save();

        profile.lists.push(list);
        await profile.save();

        return res.send({ list });
    } catch (e) {
        next(e);
    }
})


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

// ELIMINAR LISTA
router.delete('/remove/:slug', auth.required, async (req, res, next) => {
    try {
        var user = await User.findById(req.payload.id, { profile: 1, owner: 1, type: 1 })
            .populate('type')
            .populate({
                path: 'profile',
                select: 'lists',
            });

        var list = await List.findOne({ slug: req.params.slug })
            .populate({
                path: 'owner'
            })
            .populate({
                path: 'content',
                select: '_id'
            });

        if (!list) {
            return res.sendStatus(404);
        }

        // Comprobar permisos
        if (!user.type || user.type.name !== 'Admin') {
            var listOwnerId = list.owner._id.toString()
            var currentUserProfileId = user.profile._id.toString();

            if (listOwnerId !== currentUserProfileId) {
                return res.sendStatus(403);
            }
        }

        var toRemoveOriginal = list.content;
        var toRemove = toRemoveOriginal.map(o => o._id)

        // Remove content
        await List_resource.deleteMany({ _id: { $in: toRemove } });

        // Remove from user's profile
        await Profile.updateOne({ _id: list.owner._id }, {
            "$pull": { "lists": list._id }
        });

        // Remove list
        await list.remove();

        return res.sendStatus(200);
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
                select: '-content',
                populate: {
                    path: 'owner'
                }
            }
        });

        var profile = user.profile;
        var lists = profile.lists;

        return res.send({ lists });
    } catch (e) {
        next(e);
    }
});

// TODO : FILTER CONTENT
// https://stackoverflow.com/questions/16325817/in-mongoose-how-to-filter-an-array-of-objects

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
router.post('/content/:slug', auth.required, async (req, res, next) => {
    try {
        // AÑADIR SI owner O ADMIN 
        if (!req.body.resource || !req.body.resource.slug) {
            return res.sendStatus(400);
        }

        // TODO: REUTILIZABLE
        var user = await User.findById(req.payload.id, { profile: 1, owner: 1, type: 1 })
            .populate('type')
            .populate({
                path: 'profile',
                select: 'lists',
            });

        // Buscar listado
        var list = await List.findOne({ slug: req.params.slug })
            .populate({
                path: 'owner', // Profile
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'content',
                select: '-list',
                populate: {
                    path: 'resource',
                }
            });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Buscar recurso
        var resource = await Resource.findOne({ slug: req.body.resource.slug })
            .populate({
                path: 'type',
                select: 'name'
            });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        var profile = user.profile;

        // Comprobar si es usuario admin o es del usuario logueado
        if (!user.type || user.type.name !== 'Admin') {
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
        var listResource = actualContent.find(listResource => listResource.resource._id.toString() == resource._id.toString());
        if (!listResource) {
            // Añadir si no estaba
            var listResource = new List_resource();
            listResource.list = list._id;
            listResource.resource = resource;
            listResource.save();

            actualContent.push(listResource);

            await list.save();
        } else {
            console.log('Was already on the list');
        }

        // FIXME
        return res.send(listResource);
    } catch (e) {
        next(e);
    }
});

// ELIMINAR DE LISTA
router.delete('/content/:slug', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource || !req.body.resource.slug) {
            return res.sendStatus(400);
        }

        var user = await User.findById(req.payload.id)
            .populate('type')
            .populate({
                path: 'profile',
                select: 'lists'
            });

        // Buscar listado
        var list = await List.findOne({ slug: req.params.slug })
            .populate({
                path: 'owner', // Profile
                populate: {
                    path: 'owner',
                    select: 'nickname'
                }
            })
            .populate({
                path: 'content',
                populate: {
                    path: 'resource',
                }
            });

        if (!list) {
            return res.status(404).send({ error: 'List not found' });
        }

        // Buscar recurso
        var resource = await Resource.findOne({ slug: req.body.resource.slug });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        var profile = user.profile;
        // Comprobar si es usuario admin o es del usuario logueado
        if (!user.type || user.type.name !== 'Admin') {
            var userLists = profile.lists;
            // console.log('userLists', userLists);

            var result = userLists.find(currentList => {
                return currentList.toString() === list._id.toString()
            });

            if (result === -1) {
                // Esa lista no es del usuario logueado
                return res.sendStatus(403);
            }
        }

        // Comprobar si estaba en el listado 
        var elementInList = list.content.find(currentElement => currentElement.resource._id.toString() == resource._id.toString());
        if (elementInList) {
            var newList = await List.findOneAndUpdate({
                _id: list._id
            }, {
                "$pull": { "content": elementInList._id }
            },
                { new: true }
            )
                .populate({
                    path: 'owner', // Profile
                    populate: {
                        path: 'owner',
                        select: 'nickname'
                    }
                })
                .populate({
                    path: 'content',
                    populate: {
                        path: 'resource',
                    }
                });

            await elementInList.remove();
            // return res.send({ list: newList })
            return res.sendStatus(200);
        } else {
            console.log('Not in list');
        }

        return res.send({ list });
    } catch (e) {
        next(e);
    }
});

// CONTENIDO PAGINADO DE UNA LISTA
router.get('/content/:slug', auth.optional, async (req, res, next) => {
    try {
        // TODO LISTAR SI 
        //      - ES PÚBLICA
        //      - USUARIO ADMIN
        //      - USUARIO PROPIETARIO
        var list = await List.findOne({ slug: req.params.slug }, { private: 1, profile: 1 })
            .populate({
                path: 'owner',
                select: '_id'
            });
        if (!list) {
            return res.sendStatus(404);
        }

        // var profile = list.profile;

        // Comprobar si la lista es privada
        if (list.private) {
            // Comprobar usuario logueado
            if (!req.payload) {
                return res.sendStatus(403);
            }

            // Comproar si es propietario
            var user = await User.findById(req.payload.id, { type: 1, profile: 1 })
                .populate({
                    path: 'profile',
                    select: '_id'
                })
                .populate({
                    path: 'type',
                    select: 'name'
                });

            var currentUserProfileId = user.profile._id.toString();
            var listProfileId = list.owner._id.toString();

            if (currentUserProfileId !== listProfileId) {
                if (!user.type || (!user.type.name !== 'Admin')) {
                    return res.sendStatus(403);
                }
            }
        }

        var content = await List_resource.paginate({ list }, {
            limit: req.query.limit || 10,
            page: req.query.page || 1,
            select: '-list',
            sort: req.query.orderBy || '-createdAt',
            populate: {
                path: 'resource',
                select: '-description',
                populate: {
                    path: 'type',
                    select: 'name'
                }
            }
        });
        return res.send(content);
    } catch (e) {
        next(e);
    }
});

export default router;