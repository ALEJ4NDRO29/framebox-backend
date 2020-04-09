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

Suggestion_stateSchema.methods.toJSON = function () {
    return {
        name: this.name
    }
}

mongoose.model('Suggestion_state', Suggestion_stateSchema);