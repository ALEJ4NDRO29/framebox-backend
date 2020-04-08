import express from 'express';
var router = express.Router();

import auth from './auth';
import resource from './resources';
import profile from './profile';
import list from './list';
import suggestion from './suggestion';

router.use('/auth', auth);
router.use('/resource', resource);
router.use('/profile', profile);
router.use('/list', list);
router.use('/suggestion', suggestion);

export default router;