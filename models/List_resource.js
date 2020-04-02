import mongoose from 'mongoose';

const List_resource = new mongoose.Schema({
    resource: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Resource'
    }
}, {
    timestamps: true,
    usePushEach: true
});

mongoose.model('List_resource', List_resource);
