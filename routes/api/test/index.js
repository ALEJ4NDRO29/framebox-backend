import express from 'express';
import email from './email';
const router = express.Router();

router.use('/email', email);

export default router;