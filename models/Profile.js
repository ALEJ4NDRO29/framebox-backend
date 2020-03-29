const mongoose = require('mongoose');

var ProfileSchema = new mongoose.Schema({
    name: {
        type: String
    },
    viewed_content: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'List_resource'
    }],
    lists: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'List'
    }]
})

mongoose.model('Profile', ProfileSchema);