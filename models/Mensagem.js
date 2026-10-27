import mongoose from "mongoose";

// conversa entre a fono e o responsável do paciente
const mensagemSchema = new mongoose.Schema({
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    autor: { type: String, enum: ["fono", "responsavel"], required: true },
    texto: { type: String, required: true, trim: true, maxlength: 1000 },
    lida: { type: Boolean, default: false }
}, { timestamps: true });

const Mensagem = mongoose.model('Mensagem', mensagemSchema);

export default Mensagem;
