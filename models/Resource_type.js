import mongoose from 'mongoose';

const Resource_type = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

mongoose.model('Resource_type', Resource_type);
