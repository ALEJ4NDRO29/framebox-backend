import mongoose from 'mongoose';

const Resource = new mongoose.Schema({
    slug:{
        type: String,
        required: true,
    },
    type: {
        type: {type: mongoose.Schema.Types.ObjectId, ref: 'Resource_type'}
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    release_date: {
        type: Date
    }
});

mongoose.model('Resource', Resource)