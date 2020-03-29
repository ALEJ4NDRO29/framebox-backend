const mongoose = require('mongoose');

// 'mongodb://localhost/framebox'
mongoose.connect(process.env.DH_HOST, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

if (!process.env.PRODUCTION) {
    mongoose.set('debug', true)
}

require('./Profile');
require('./User_type');
require('./User');
require('./Resource_type');
require('./Resource');
require('./List_resource');
require('./List');

console.log('Load DB Models');
