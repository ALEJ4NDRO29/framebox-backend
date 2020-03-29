const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

var UserSchema = new mongoose.Schema({
    type: {type: mongoose.Schema.Types.ObjectId, ref: 'User_type'},
    username: {
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
        match: [/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/, 'is invalid']
    },
    hash: String,
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    salt: String
}, {
    timestamps: true,
    usePushEach: true
});

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

mongoose.model('User', UserSchema)