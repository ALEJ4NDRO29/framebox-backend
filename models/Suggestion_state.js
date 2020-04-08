import mongoose from 'mongoose';

var Suggestion_stateSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

mongoose.model('Suggestion_state', Suggestion_stateSchema);