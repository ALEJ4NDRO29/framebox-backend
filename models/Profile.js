import mongoose from 'mongoose';

var ProfileSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    name: {
        type: String
    },
    karma: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    bio: {
        type: String
    },
    website: {
        type: String
    },
    status: {
        type: String
    },
    viewed_content: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'List_resource'
    }],
    lists: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'List'
    }]
}, {
    timestamps: true
})

ProfileSchema.methods.isViewed = function (resourceId) {
    var found = this.viewed_content.find(listResource => listResource.resource._id.toString() == resourceId._id.toString());
    return typeof found !== "undefined";
}

ProfileSchema.methods.toJSON = function () {
    return ({
        name: this.name,
        karma: this.karma,
        bio: this.bio,
        website: this.website,
        status: this.status,
        viewed_content: this.viewed_content
    });
}

ProfileSchema.methods.toDetailsJSON = function () {
    var res = {
        name: this.name,
        karma: this.karma,
        bio: this.bio,
        website: this.website,
        status: this.status,
        viewed_content: {
            size: this.viewed_content.length
        },
        lists: {
            size: this.lists.length
        }
    }

    if(this.owner && this.owner.nickname) {
        res.nickname = this.owner.nickname;
    }

    return res;
}

mongoose.model('Profile', ProfileSchema);