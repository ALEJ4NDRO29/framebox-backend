import express from 'express';
import auth from '../../authJwt';
import { IsAdminUser } from '../../../utils/UsersUtils';
const router = express.Router();

router.post('/add', auth.required, async (req, res, next) => {
    try {
        if (!req.body.resource) {
            return res.sendStatus(400);
        }
    } catch (e) {
        next(e);
    }
});

router.put('/state', auth.required, async (req, res, next) => {
    try {
        if(!IsAdminUser(req.payload.id)) {
            return res.sendStatus(403);
        }

        
    } catch (e) {
        next(e);
    }
});

export default router;