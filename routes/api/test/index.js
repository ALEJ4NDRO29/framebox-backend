import express from 'express';
import email from './email';
import profile from './profile';
const router = express.Router();

const testEnabled = true;

if(testEnabled) {
    router.use('/email', email);
    router.use('/profile', profile);
}

export default router;