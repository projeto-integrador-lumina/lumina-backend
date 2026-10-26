import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema({
    id_conversa: { type: mongoose.Schema.Types.ObjectId, ref: "Conversa", required: true, index: true },
    remetente: { type: String, enum: ["Fono", "Responsavel"], required: true },
    conteudo: { type: String, required: true, trim: true },
    lida: { type: Boolean, default: false }
}, { timestamps: true });

const Mensagem = mongoose.model('Mensagem', mensagemSchema);

export default Mensagem;