import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

const Resource_typeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

Resource_typeSchema.plugin(mongooseUniqueValidator, { message: 'is already taken.' })

Resource_typeSchema.methods.toJSON = function () {
    return {
        name: this.name
    }
}

mongoose.model('Resource_type', Resource_typeSchema);
