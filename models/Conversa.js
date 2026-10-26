import mongoose from "mongoose";

const conversaSchema = new mongoose.Schema({
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    ultima_mensagem: { type: String, default: "" },
    ultima_mensagem_em: Date
}, { timestamps: true });

// só pode existir uma conversa por dupla fono + paciente
conversaSchema.index({ id_fono: 1, id_paciente: 1 }, { unique: true });

const Conversa = mongoose.model('Conversa', conversaSchema);

export default Conversa;