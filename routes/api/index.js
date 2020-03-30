import express from 'express';
const router = express.Router();

import v1 from './v1';
router.use('/v1', v1);

// module.exports = router;
export default router;