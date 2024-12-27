const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    bitpoints_min: {
        type: Number,
        required: true
    },
    bitpoints_max: {
        type: Number,
        required: true
    },
    image_url: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Badge', badgeSchema);