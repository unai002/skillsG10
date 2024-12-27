const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    admin: {
        type: Boolean,
        default: false
    },
    completedSkills: {
        type: [String],
        default: []
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;