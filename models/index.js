import mongoose from 'mongoose';

// 'mongodb://localhost/framebox' process.env.DH_HOST
mongoose.connect(process.env.DH_HOST || 'mongodb://localhost/framebox', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

if (!process.env.PRODUCTION) {
    mongoose.set('debug', true)
}

import './Profile';
import './User_type';
import './User';
import './Resource_type';
import './Resource';
import './List_resource';
import './List';

console.log('Load DB Models');
