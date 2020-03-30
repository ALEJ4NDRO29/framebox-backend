// var express = require('express');

import express from 'express';
var router = express.Router();


router.use('/auth', require('./auth'));

module.exports = router;