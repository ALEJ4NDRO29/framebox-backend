import nodemailer from 'nodemailer';

var transport;

/**
 * Initialize email transport service
 */
export function initializeEmail() {
    transport = nodemailer.createTransport({
        // pool: true,
        host: process.env.EMAIL_HOST, // "smtp.gmail.com",
        port: process.env.EMAIL_PORT, // 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: process.env.EMAIL_ACCOUNT, // Cargar siempre de .env
            pass: process.env.PASSWORD_ACCOUNT
        }
    });
    transport.verify(function (error, success) {
        if (error) {
            console.log('Email Error', error);
        } else {
            console.log('Email verified', success);
        }
    })
}

/**
 * Send email
 * @param {Object} params - Email params
 * @param {String} params.from - From email
 * @param {String} params.to - To email
 * @param {String} params.subject - Email subject
 * @param {String} params.text - Email body
 */
export function sendEmail(params) {
    return transport.sendMail(params);
}

/**
 * Send Welcome email
 * @param {String} to - To email
 * @param {String} nickname - User's nickname
 */
export function sendWelcome(to, nickname) {
    var params = {
        from: '"Framebox" <framebox.web@gmail.com>',
        to: to,
        subject: "Welcome to Framebox",
        text: `Hello ${nickname} and welcome.`
    }

    return sendEmail(params);
}