import express from 'express';
var router = express.Router();

import auth from './auth';
import resource from './resources';
import profile from './profile';
import list from './list';
import review from './review';
import suggestion from './suggestion';

router.use('/auth', auth);
router.use('/resource', resource);
router.use('/profile', profile);
router.use('/list', list);
router.use('/review', review);
router.use('/suggestion', suggestion);

router.get('/echo/:echo', (req, res) => {
    return res.send(req.params.echo)
});

export default router;