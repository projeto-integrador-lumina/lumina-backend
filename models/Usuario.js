import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user: String,
    password: String,
    type: String,
    active: String
});

const User = mongoose.model('User', userSchema);

export default User;