// database setup
const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: { 
        type: String,
        required: true
    },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    }
}, { timestamps : true });

const User = mongoose.model('User', UserSchema);

module.exports = { User };
