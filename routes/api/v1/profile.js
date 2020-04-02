import express from 'express';
import auth from '../../authJwt';
import { IsAdminUser } from '../../../utils/UsersUtils';
const router = express.Router();

// UPDATE / DELETE
// User -> Solo podrá actualizar su perfil
// Admin -> Podrá actualizar todos los perfiles

// DELETE
// Eliminar perfil y ¿usuario?

router.put('/update/nickname/:nickname', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });
    } catch (e) {
        next(e);
    }
});

router.put('/update/me', auth.required, async (req, res, next) => {
    try {
        
    } catch (e) {
        next(e);
    }
});

router.delete('/delete/nickname/:nickname', auth.required, async (req, res, next) => {
    try {
        if (!await IsAdminUser(req.payload.id))
            return res.status(401).json({ error: 'Unauthorized' });
    } catch (e) {
        next(e);
    }
});

router.delete('/delete/me', auth.required, async (req, res, next) => {

});

export default router;