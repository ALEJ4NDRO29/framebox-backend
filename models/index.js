import mongoose from 'mongoose';

// 'mongodb://localhost/framebox' process.env.DH_HOST
setTimeout(() => {
    var connectionPath = `mongodb://${process.env.DH_HOST}/framebox`;
    console.log(connectionPath);
    mongoose.connect(connectionPath, { useNewUrlParser: true, useUnifiedTopology: true });
}, 2000);

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

// if (!process.env.PRODUCTION) {
//     mongoose.set('debug', true)
// }

import './Profile';
import './User_type';
import './User';
import './Resource_type';
import './Resource';
import './List_resource';
import './List';
import './Suggestion_state';
import './Suggestion';
import './Review';

console.log('Load DB Models'.grey);

export const User_type = mongoose.model('User_type');
export const User = mongoose.model('User');
export const Profile = mongoose.model('Profile');

export const Resource_type = mongoose.model('Resource_type');
export const Resource = mongoose.model('Resource'); //
export const List_resource = mongoose.model('List_resource'); //
export const List = mongoose.model('List'); //
export const Suggestion_state = mongoose.model('Suggestion_state');
export const Suggestion = mongoose.model('Suggestion'); //
export const Review = mongoose.model('Review'); //

// Create default data
checkUsers();

checkResType('Movie');
checkResType('Serie');
checkResType('Music');
checkResType('Videogame');
checkResType('Book');

checkSuggestionState('Received');
checkSuggestionState('In_course');
checkSuggestionState('Accepted');
checkSuggestionState('Denied');

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

    var adminUser = await User.findOne({ nickname: process.env.ADMIN_NICKNAME || 'admin' });

    // Crear usuario admin si no existe
    if (!adminUser) {
        console.log('Create Admin User'.grey);
        adminUser = new User();

        adminUser.nickname = process.env.ADMIN_NICKNAME || 'admin';
        adminUser.email = process.env.ADMIN_EMAIL || 'admin@admin.com';
        adminUser.type = adminType;
        adminUser.setPassword(process.env.ADMIN_PASSWORD || 'admin');
        adminUser.createProfile();

        var profile = new Profile();
        profile.owner = adminUser;
        adminUser.profile = profile;
        await adminUser.save();
        await profile.save();
    }
}

async function checkResType(typeName) {
    console.log(`Check ${typeName} type`.grey);
    var type = await Resource_type.findOne({ name: typeName });
    if (!type) {
        console.log(`Create ${typeName} type`.grey);
        type = new Resource_type();
        type.name = typeName;
        return type.save();
    }
}

async function checkSuggestionState(stateName) {
    console.log(`Check ${stateName} suggestion state`.grey);
    var state = await Suggestion_state.findOne({ name: stateName });
    if (!state) {
        console.log(`Create ${stateName} state`.grey);
        state = new Suggestion_state();
        state.name = stateName;
        return state.save();
    }
}