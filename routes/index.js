import express from 'express';
const router = express.Router();

import api from './api';

router.use('/', api);

export default router;