import express from 'express';
import { sendEmail } from '../../../utils/EmailUtils';
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        var params = {
            from: '"Framebox" <framebox.web@gmail.com>',
            to: "josealejandro.r.29@gmail.com",
            subject: "It's Works ✔",
            text: "Hello from Frambox"
        }
        // var resEmail = await sendEmail(params);
        return res.send({resEmail});
    } catch (e) {
        next(e);
    }
})

export default router;