const mongoose = require('mongoose');

const List = new mongoose.Schema({
    name: {
        type: String ,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date
    },
    content: [{type: mongoose.Schema.Types.ObjectId, ref: 'List_resource'}]
});

mongoose.model('List', List);