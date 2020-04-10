import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    review: {
        type: String,
    }
}, {
    timestamps: true
});

ReviewSchema.methods.toJSON = function () {
    var res = {
        id: this._id
    };

    if (this.profile && this.profile.owner && this.profile.owner.nickname) {
        res.profile = {
            nickname: this.profile.owner.nickname
        };
    }

    if (this.resource && this.resource.title) {
        res.resource = {};

        if (this.resource.type && this.resource.type.name) {
            res.resource.type = { name: this.resource.type.name }
        }

        res.resource.title = this.resource.title;
        res.resource.imageUrl = this.resource.imageUrl;
        res.resource.company = this.resource.company;
        res.resource.releasedAt = this.resource.releasedAt;
    }

    res.rate = this.rate;
    res.review = this.review;
    res.createdAt = this.createdAt;

    return res;
}

mongoose.model('Review', ReviewSchema);