import mongoose from "mongoose";

const fonoSchema = new mongoose.Schema({
    nome: String,
    email: String,
    crfa: String,
    telefone: String,
    foto_perfil: String
});

const Fonoaudiologo = mongoose.model('Fonoaudiologo', fonoSchema);

export default Fonoaudiologo;