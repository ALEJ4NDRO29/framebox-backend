import express from "express";
import auth from "../../authJwt";
import mongoose from "mongoose";
import { IsAdminUser } from "../../../utils/UsersUtils";
const router = express.Router();

// CREAR TIPO DE RECURSO (PELÍCULA, SERIE...)

// CREAR RECURSO
router.post('/', auth.required, async (req, res, next) => {
    try {
        if(await IsAdminUser(req.payload.id)) {
            console.log('Is admin!!');
        } else {
            return res.status(401).json({error: 'Unauthorized'})
        }
        
        return res.send(req.payload);
    } catch (e) {
        next(e);
    }
});

export default router;