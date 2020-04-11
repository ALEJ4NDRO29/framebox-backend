import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const List_resourceSchema = new mongoose.Schema({
    profile: {
        // Utilizar para el listado de vistos
        type: mongoose.Schema.Types.ObjectId, ref: 'Profile'
    },
    list: {
        // Utilizar en las listas
        type: mongoose.Schema.Types.ObjectId, ref: 'List'
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Resource'
    }
}, {
    timestamps: true,
    usePushEach: true
});

List_resourceSchema.plugin(mongoosePaginate);

List_resourceSchema.methods.toJSON = function () {
    var res = {};

    if (this.profile && this.profile.owner && this.profile.owner.nickname) {
        res.profile = {
            nickname: this.profile.owner.nickname
        }
    }

    // res.list = this.list;
    res.resource = this.resource;
    res.createdAt = this.createdAt;

    return res;
}

mongoose.model('List_resource', List_resourceSchema);
