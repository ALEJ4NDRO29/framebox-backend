import express from "express";
import auth from "../../authJwt";
import mongoose from "mongoose";
import { IsAdminUser } from "../../../utils/UsersUtils";
const router = express.Router();

const Resource = mongoose.model('Resource');
const Resource_type = mongoose.model('Resource_type');

// CREAR TIPO DE RECURSO (PELÍCULA, SERIE...)
router.post('/types', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var type = new Resource_type();
        type.name = req.body.resourceType.name;

        await type.save();
        return res.send({ name: type.name });
    } catch (e) {
        next(e);
    }
});

// Recuperar todos los tipos
router.get('/types', async (req, res, next) => {
    try {
        var types = await Resource_type.find().select({ name: 1, _id: 0 });
        return res.send({ types });
    } catch (e) {
        next(e);
    }
});

// Buscar tipo
router.get('/types/:name', async (req, res, next) => {
    try {
        var type = await Resource_type.findOne({ name: req.params.name }).select({ _id: 0, name: 1 });

        if (type) {
            return res.send({ type });
        } else {
            return res.sendStatus(404);
        }
    } catch (e) {
        next(e)
    }
});


// CREAR RECURSO
router.post('/', auth.required, async (req, res, next) => {
    try {
        // Comprobar datos obligatorios
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        if (!req.body.resource.type) {
            return res.status(400).json({ error: 'type not set' });
        }

        if (!req.body.resource.title) {
            return res.status(400).json({ error: 'title not set' });
        }

        var type = await Resource_type.findOne({ name: req.body.resource.type });
        if (!type) {
            return res.status(404).json({ error: 'Type not found' });
        }

        // Crear recurso
        var resource = new Resource();
        resource.title = req.body.resource.title;
        resource.type = type;
        resource.description = req.body.resource.description;
        resource.imageUrl = req.body.resource.imageUrl;
        resource.company = req.body.resource.company;
        resource.releasedAt = req.body.resource.releasedAt;

        await resource.save();

        return res.status(201).send(resource);
    } catch (e) {
        next(e);
    }
});

// Listado
router.get('/', async (req, res, next) => {
    // TODO: PAGINATE
    try {
        var resources = await Resource.find().populate('type');
        return res.send({resources});
    } catch (e) {
        next(e);
    }
});

// Details
router.get('/slug/:slug', async (req, res, next) => {
    try {
        var resource = await Resource.findOne({ slug: req.params.slug }).populate('type');

        if (!resource)
            return res.sendStatus(404);

        return res.send({resource});
    } catch (e) {
        next(e);
    }
});

// Update
router.put('/slug/:slug', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var resource = await Resource.findOne({ slug: req.params.slug }).populate('type');

        if (!resource) {
            return res.sendStatus(404).json({ error: "Resource not found" });
        }

        // Actualizar tipo
        if (req.body.resource.type) {
            var type = await Resource_type.findOne({ name: req.body.resource.type });
            if (!type) {
                return res.sendStatus(404).json({ error: "Type not found" });
            }

            resource.type = type;
        }

        if (req.body.resource.title) {
            resource.title = req.body.resource.title;
        }

        resource.description = req.body.resource.description;
        resource.imageUrl = req.body.resource.imageUrl;
        resource.company = req.body.resource.company;
        resource.releasedAt = req.body.resource.releasedAt;

        await resource.save();

        return res.send({resource});
    } catch (e) {
        next(e);
    }
});

// Delete
router.delete('/slug/:slug', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });

        var resource = await Resource.findOne({ slug: req.params.slug });
        if (!resource) {
            return res.sendStatus(404);
        }

        await resource.remove();

        return res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

// TODO FILTER -> req.query.

export default router;