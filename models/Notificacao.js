import mongoose from "mongoose";

const notificacaoSchema = new mongoose.Schema({
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    tipo: { type: String, required: true },  
    texto: { type: String, required: true },
    lida: { type: Boolean, default: false }
}, { timestamps: true });

const Notificacao = mongoose.model('Notificacao', notificacaoSchema);

export default Notificacao;
