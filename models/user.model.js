import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name not defined'],
        trim: true,
        minLength: [3, 'User name must be at least 3 characters long'],
        maxLength: [50, 'User name must be less than 50 characters long']
    },
    email: {
        type: String,
        required: [true, 'User email not defined'],
        unique: true,
        trim: true,
        minLength: [5, 'User email must be at least 5 characters long'],
        maxLength: [100, 'User email must be less than 100 characters long'], 
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'User email is not valid']
    },
    password: {
        type: String,
        required: [true, 'User password not defined'],
        trim: true,
        minLength: [6, 'User password must be at least 6 characters long'],
        maxLength: [100, 'User password must be less than 100 characters long']
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;