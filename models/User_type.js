import mongoose from 'mongoose';

const User_type = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

mongoose.model('User_type', User_type);