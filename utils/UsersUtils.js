import mongoose from "mongoose";
const User = mongoose.model('User');
const List = mongoose.model('List');
const List_resource = mongoose.model('List_resource');

/**
 * @param {ObjectId} id
 * @returns Boolean true if user is admin
 */
export async function IsAdminUser(id) {
    var user = await User.findById(id).populate('type');
    return user.isAdmin();
}

async function removeUser(user) {
    var profile = user.profile;

    console.log('Removing viewed');
    await List_resource.remove({ profile });

    console.log('Removing List_resources');
    var lists = await List.find({ owner: profile });
    await List_resource.remove({ list: { $in: lists } })

    console.log('Removing list');
    await List.remove(profile);

    console.log('Removing profile');
    await profile.remove();

    console.log('Removing user');
    await user.remove();
}

/**
 * Remove user data from user id
 * @param {String} id - User id
 */
export async function removeUserById(id) {
    if (id) {
        var user = await User.findById(id).populate('profile');
        await removeUser(user);
    }
}

/**
 * Remove user data from user nickname
 * @param {String} nickname - User nickname
 */
export async function removeUserByNickname(nickname) {
    if(nickname) {
        var user = await User.findOne({nickname}).populate('profile');
        await removeUser(user);
    }
}
