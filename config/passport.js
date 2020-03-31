import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import mongoose from "mongoose";

const User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]'
}, function (email, password, done) {
    console.log('Validate user'.blue);

    User.findOne({ email: email })
        .populate('type')
        .then(function (user) {
            console.log("Found user: ".blue + email);

            if (!user || !user.validPassword(password)) {
                return done(null, false, { errors: { 'email or password': 'is invalid' } });
            }
            return done(null, user);
        }).catch(done);
}));