import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
import slug from 'slug';
import { Review } from '.';

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
    imageUrl: {
        type: String,
    },
    company: {
        type: String
    },
    releasedAt: {
        type: Date
    }
}, {
    timestamps: true,
    usePushEach: true
});

ResourceSchema.plugin(mongooseUniqueValidator, { message: 'is already taken.' });
ResourceSchema.plugin(mongoosePaginate);

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

ResourceSchema.methods.getRate = async function () {
    var rate = await Review.aggregate([
        {
            $match:
            {
                resource: this._id
            }
        },
        {
            $group: {
                _id: null,
                value: {
                    $avg: '$rate'
                },
                count: {
                    $sum: 1
                }
            }
        }
    ]);

    var res = {
        value: 0,
        count: 0
    }

    if (rate.length > 0) {
        res.value = rate[0].value;
        res.count = rate[0].count;

    }

    return res;
}

ResourceSchema.methods.toAdminJSON = function () {
    return {
        slug: this.slug,
        type: this.type.toJSON(),
        title: this.title,
        description: this.description,
        imageUrl: this.imageUrl,
        company: this.company,
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
        imageUrl: this.imageUrl,
        company: this.company,
        description: this.description,
        releasedAt: this.releasedAt,
    }
}

mongoose.model('Resource', ResourceSchema);