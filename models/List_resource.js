import mongoose from 'mongoose';

const List_resourceSchema = new mongoose.Schema({
    resource: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Resource'
    }
}, {
    timestamps: true,
    usePushEach: true
});

List_resourceSchema.methods.toJSON = function () {
    return {
        resource: this.resource,
        createdAt: this.createdAt
    }
}

mongoose.model('List_resource', List_resourceSchema);
