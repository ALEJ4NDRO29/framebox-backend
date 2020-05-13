# Framebox - Backend

Frontend repository: <br>
https://github.com/ALEJ4NDRO29/framebox-frontend

## Requirements (Used during development)

- [Node 12.16.1](https://nodejs.org/es/)

- [MongoDB 4.2.5](https://www.mongodb.com/)


## Configure
Replace .env.template to .env with next content (Replace [-] ):

```
SECRET=[App secret for JWT]

EMAIL_HOST=[Email service Ex: smtp.gmail.com ]
EMAIL_PORT=[Email port Ex: 465]
EMAIL_ACCOUNT=
PASSWORD_ACCOUNT=

DH_HOST=[Host from your MongoDB Ex: localhost]

ADMIN_NICKNAME=[Default Admin user nickname Ex: admin]
ADMIN_EMAIL=[Default Admin user email]
ADMIN_PASSWORD=[Password for admin user]

```

Can you generate app password for [Google email](https://support.google.com/mail/answer/185833).

### Install:

    npm install

### Start develop mode:

    npm run dev

### Start production:

    npm start

