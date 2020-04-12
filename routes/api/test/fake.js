import express from 'express';
import faker from 'faker';
import { Resource, Resource_type } from "../../../models";

const router = express.Router();

router.post('/resource/:qty', async (req, res, next) => {
    try {
        var qty = req.params.qty;
        var types = await Resource_type.find({}, {_id:1});

        var toInsert = [];

        for (let i = 0; i < qty; i++) {
            toInsert.push(new Resource({
                type: types[faker.random.number(types.length - 1)]._id, 
                title: faker.commerce.productName()
            }));
        }
    
        await Resource.insertMany(toInsert);
        return res.sendStatus(200);    
    } catch (e) {
        next(e);
    }
});

export default router;