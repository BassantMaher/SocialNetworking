const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }, 
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
}, { timestamps: true }); // timestamps creates created at and updatedat fields

module.exports = mongoose.model('Post', postSchema);