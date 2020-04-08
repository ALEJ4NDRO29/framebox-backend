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

export function sendEmail(params) {
    return transport.sendMail(params);
}
