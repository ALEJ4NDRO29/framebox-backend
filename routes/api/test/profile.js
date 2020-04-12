import express from 'express';
import { increaseKarmaByUserId, increaseKarmaByNickname } from '../../../utils/ProfileUtils';
const router = express.Router();

router.post('/karma/increase/user/id/:id/:qty', async(req, res, next) => {
    try {
        await increaseKarmaByUserId(req.params.id, req.params.qty);
        return res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.post('/karma/increase/user/nickname/:nickname/:qty', async(req, res, next) => {
    try {
        await increaseKarmaByNickname(req.params.nickname, req.params.qty);
        return res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

export default router;