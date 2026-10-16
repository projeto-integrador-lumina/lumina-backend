import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    usuario: String,
    senha: String,
    tipo: String,
    ativo: String
});

const User = mongoose.model('User', userSchema);

export default User;