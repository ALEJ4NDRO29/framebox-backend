import mongoose from "mongoose";
const User = mongoose.model('User');

/**
 * @param {ObjectId} id
 * @returns Boolean true if user is admin
 */
export async function IsAdminUser (id) {
    var user = await User.findById(id).populate('type');
    return user.isAdmin();
}