import mongoose, { mongo } from 'mongoose';

// 'mongodb://localhost/framebox' process.env.DH_HOST
mongoose.connect(process.env.DH_HOST || 'mongodb://localhost/framebox', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

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

console.log('Load DB Models'.grey);

// Create default data
const User_type = mongoose.model('User_type');
const User = mongoose.model('User');

const Resource_type = mongoose.model('Resource_type');

checkUsers();

checkResType('Movie');
checkResType('Serie');
checkResType('Music');
checkResType('Videogame');

async function checkUsers() {
    console.log("Check Admin Type".grey);

    var adminType = await User_type.findOne({ name: 'Admin' });

    // Comprobar y crear rol Admin
    if (!adminType) {
        console.log("Create Admin Type".grey);

        adminType = new User_type();
        adminType.name = 'Admin';

        await adminType.save();
    }

    console.log("Check AdminUser".grey);

    var adminUser = await User.findOne({nickname: process.env.ADMIN_NICKNAME || 'admin'});

    // Crear usuario admin si no existe
    if (!adminUser) {
        console.log('Create Admin User'.grey);
        adminUser = new User();

        adminUser.nickname = process.env.ADMIN_NICKNAME || 'admin';
        adminUser.email =  process.env.ADMIN_EMAIL || 'admin@admin.com';
        adminUser.type = adminType;
        adminUser.setPassword(process.env.ADMIN_PASSWORD || 'admin');
        adminUser.createProfile();

        await adminUser.save();
    }  
}

async function checkResType(typeName) {
    console.log(`Check ${typeName} type`.grey);
    var type = await Resource_type.findOne({name: typeName});
    if (!type) {
        console.log(`Create ${typeName} type`.grey);
        type = new Resource_type();
        type.name = typeName;
        type.save();
    }
}
