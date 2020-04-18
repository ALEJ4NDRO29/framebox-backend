import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from 'cors';
import 'colors';

// import { config } from "dotenv";
// config();

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database / models
// require('./models');
import './models';
import './config/passport';

import routes from "./routes";
app.use('/api', routes);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
    console.log(err.stack.red);

    res.status(err.status || 500);

    res.json({
        'errors': {
            message: err.message,
            error: err // TODO: DESACTIVAR EN PRODUCCIÓN 
        }
    });
});

export default app;
