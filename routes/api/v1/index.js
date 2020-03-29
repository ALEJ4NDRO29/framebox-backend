var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    return res.json({ text: 'Hello World from api' });
});

module.exports = router;
