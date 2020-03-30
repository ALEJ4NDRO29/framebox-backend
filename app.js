import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

require('dotenv').config();

// import { config } from "dotenv";
// config();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database / models
// require('./models');
import './models'

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
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
        'errors': {
            message: err.message,
            error: err
        }
    });
});

export default app;

// module.exports = app;


