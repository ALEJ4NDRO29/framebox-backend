import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import slug from 'slug';

const ListSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },
    
    private: {
        type: Boolean,
        default: false
    },
    
    content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List_resource' }]
}, {
    timestamps: true,
});

ListSchema.plugin(mongooseUniqueValidator, { message: 'is already taken.' });

ListSchema.pre("validate", function () {
    if (!this.slug) {
        this.slugify();
    }
});

ListSchema.methods.slugify = function () {
    this.slug = slug(this.name) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
}

ListSchema.methods.isPrivate = function () {
    return this.private;
}

ListSchema.methods.toJSON = function () {
    return {
        slug: this.slug,
        name: this.name,
        description: this.description,
        private: this.private,
        content: this.content,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

mongoose.model('List', ListSchema);