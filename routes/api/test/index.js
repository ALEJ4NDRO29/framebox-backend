import express from 'express';
import email from './email';
import profile from './profile';
import fake from './fake';
const router = express.Router();

    router.use('/email', email);
    router.use('/profile', profile);
    router.use('/fake', fake);

    router.get('/echo/:echo', (req, res) => {
        return res.send(req.params.echo)
    });
export default router;