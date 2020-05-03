import { User, Profile } from "../models";

async function updateKarma(user, qty) {
    var profile = user.profile;

    var profile = await Profile.findOneAndUpdate({ _id: profile }, { $inc: { karma: qty } }, { "fields": { karma: 1 }, new: true });
    if (profile.karma < 0) {
        profile.karma = 0;
        await profile.save();
    }
}


/**
 * @param {String} id - User id
 * @param {Number} qty - Quantity to update
 */
export async function increaseKarmaByUserId(id, qty) {
    var user = await User.findById(id, { profile: 1 });
    if (user)
        updateKarma(user, qty);
}

/**
 * @param {String} nickname - User nickname
 * @param {Number} qty - Quantity to update
 */
export async function increaseKarmaByNickname(nickname, qty) {
    var user = await User.findOne({ nickname }, { profile: 1 });
    if (user)
        updateKarma(user, qty);
}
