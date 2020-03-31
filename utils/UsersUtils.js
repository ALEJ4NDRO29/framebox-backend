import mongoose from "mongoose";
const User = mongoose.model('User');

export async function IsAdminUser (id) {
    var user = await User.findById(id).populate('type');
    return user.isAdmin();
}