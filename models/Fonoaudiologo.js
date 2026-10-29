import mongoose from "mongoose";

const fonoSchema = new mongoose.Schema({
    id_login: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true },
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    crfa: { type: String, required: true, trim: true, unique: true },
    telefone: { type: String, required: true, trim: true },
    foto_perfil: String
}, { timestamps: true });

const Fonoaudiologo = mongoose.model('Fonoaudiologo', fonoSchema);

export default Fonoaudiologo;
