import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import slug from 'slug';

const ResourceSchema = new mongoose.Schema({
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
    timestamps: true,
    usePushEach: true
});

ResourceSchema.plugin(mongooseUniqueValidator, { message: 'is already taken.' });

ResourceSchema.pre("validate", function () {
    if (!this.slug) {
        this.slugify();
    }
});

ResourceSchema.methods.slugify = function () {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

ResourceSchema.methods.setType = function (type) {
    this.type = type;
};

ResourceSchema.methods.toAdminJSON = function () {
    return {
        slug: this.slug,
        type: this.type.toJSON(),
        title: this.title,
        description: this.description,
        releasedAt: this.releasedAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

ResourceSchema.methods.toJSON = function () {
    return {
        slug: this.slug,
        type: this.type.toJSON(),
        title: this.title,
        description: this.description,
        releasedAt: this.releasedAt,
    }
}

mongoose.model('Resource', ResourceSchema);