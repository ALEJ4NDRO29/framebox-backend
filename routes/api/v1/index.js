import express from 'express';
var router = express.Router();

import auth from './auth';
import resource from './resources';

router.use('/auth', auth);
router.use('/resource', resource)

export default router;