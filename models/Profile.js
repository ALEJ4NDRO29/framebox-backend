import mongoose from 'mongoose';

var ProfileSchema = new mongoose.Schema({
    name: {
        type: String
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
})

ProfileSchema.methods.toJSON = function () {
    return ({
        name: this.name,
        bio: this.bio,
        website: this.website,
        status: this.status,
        viewed_content: this.viewed_content
    });
}

mongoose.model('Profile', ProfileSchema);