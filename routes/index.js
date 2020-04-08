import express from 'express';
const router = express.Router();

import api from './api';
import test from './api/test';

router.use('/', api);
router.use('/test', test);

export default router;