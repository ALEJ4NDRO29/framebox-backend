import express from 'express';
const router = express.Router();
import test from './api/test';
import api from './api';

const testEnabled = false;


router.use('/', api);
if (testEnabled) {
    router.use('/test', test);
}


export default router;