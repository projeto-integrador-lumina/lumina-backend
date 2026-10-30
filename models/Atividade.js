import mongoose from "mongoose";

const atividadeSchema = new mongoose.Schema({
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    fonema: { type: String, required: true, trim: true },
    posicao: { type: String, required: true, trim: true },
    frequencia: { type: Number, min: 1 },
    tempo_pratica: { type: Number, min: 1 }
}, { timestamps: true });

const Atividade = mongoose.model('Atividade', atividadeSchema);

export default Atividade;