import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from "mongoose-unique-validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import config from "../config";

const Profile = mongoose.model('Profile')

var UserSchema = new mongoose.Schema({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'User_type' },
    nickname: {
        type: String,
        index: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^([a-zA-Z0-9])\w+/, 'is invalid']
    },
    email: {
        type: String,
        lowercase: true,
        required: [true, "can't be blank"],
        unique: true,
        match: [/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/, 'is invalid']
    },
    hash: String,
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    salt: String
}, {
    timestamps: true,
    usePushEach: true
});

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });
UserSchema.plugin(mongoosePaginate);

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
}

UserSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
}

UserSchema.methods.createProfile = function () {
    this.profile = new Profile()
    this.nickname = this.nickname; // FIXME
    return this.profile.save();
}

UserSchema.methods.generateJWT = function () {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        nickname: this.nickname,
        exp: parseInt(exp.getTime() / 1000),
    }, config.secret);
};

UserSchema.methods.toAuthJson = function () {
    var user = {
        nickname: this.nickname,
        email: this.email,
        jwt: this.generateJWT()
    }

    if (this.type && this.type.name) {
        user.type = this.type.name;
    }

    return user;
}

UserSchema.methods.toJSON = function () {
    var user = {
        nickname: this.nickname,
        email: this.email
    }

    if (this.type && this.type.name) {
        user.type = this.type.name;
    }

    return user;
}

UserSchema.methods.isAdmin = function () {
    var isAdmin = this.type != null && this.type.name === 'Admin';
    return isAdmin;
}

UserSchema.methods.updateProfile = function (profile, updateData) {
    profile.name = updateData.name;
    profile.bio = updateData.bio;
    profile.status = updateData.status;
    profile.website = updateData.website;

    return profile.save();
}

mongoose.model('User', UserSchema)