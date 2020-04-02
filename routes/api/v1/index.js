import express from 'express';
var router = express.Router();

import auth from './auth';
import resource from './resources';
import profile from './profile';
import list from './list';

router.use('/auth', auth);
router.use('/resource', resource);
router.use('/profile', profile);
router.use('/list', list);

export default router;