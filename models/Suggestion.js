import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import slug from 'slug';

var SuggestionSchema = new mongoose.Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Suggestion_state',
        required: true
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
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
    imageUrl: {
        type: String
    },
    company: {
        type: String
    },
    releasedAt: {
        type: Date
    }
}, {
    timestamps: true
});

SuggestionSchema.pre('validate', function () {
    if (!this.slug) {
        this.slugify();
    }
});

SuggestionSchema.plugin(mongoosePaginate);

SuggestionSchema.methods.slugify = function () {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

SuggestionSchema.methods.toJSON = function () {
    var res = {
        slug: this.slug,
        title: this.title,
        description: this.description,
        imageUrl: this.imageUrl,
        company: this.company,
        releasedAt: this.releasedAt,
        createdAt: this.createdAt
    }

    if (this.state && this.state.name) {
        res.state = this.state.name;
    }

    if (this.profile && this.profile.owner) {
        res.profile = {
            nickname: this.profile.owner.nickname
        }
    }

    return res;
}

mongoose.model('Suggestion', SuggestionSchema);
