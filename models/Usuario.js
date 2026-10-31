import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true, trim: true, lowercase: true },
    senha: { type: String, required: true }, 
    tipo: { type: String, enum: ["Fono", "Paciente"], required: true },
    ativo: { type: Boolean, default: true },
    precisa_trocar_senha: { type: Boolean, default: false },
    ultimo_acesso: { type: Date, default: null }
}, { timestamps: true });


const Usuario = mongoose.model('Usuario', userSchema);

export default Usuario;
