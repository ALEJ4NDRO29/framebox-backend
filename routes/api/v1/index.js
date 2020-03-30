import express from 'express';
var router = express.Router();

import auth from './auth';

router.use('/auth', auth);

// module.exports = router;
export default router;