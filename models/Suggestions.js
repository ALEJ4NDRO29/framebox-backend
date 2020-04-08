import mongoose from 'mongoose';
import slug from 'slug';

var SuggestionScheme = new mongoose.Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Suggestion_state'
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Profile'
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource_type',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    releasedAt: {
        type: Date
    }
}, {
    timestamps: true
});

SuggestionScheme.pre('validate', function () {
    if (!this.slug) {
        this.slugify();
    }
})

SuggestionScheme.methods.slugify = function () {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

mongoose.model('Suggestion', SuggestionScheme);
