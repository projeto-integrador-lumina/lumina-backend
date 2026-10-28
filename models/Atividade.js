import mongoose from "mongoose";

const atividadeSchema = new mongoose.Schema({
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    tipo: { type: String, enum: ["treino", "missao"], required: true },
    titulo: { type: String, trim: true, maxlength: 80 },
    palavras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Palavra" }],
    concluida_em: { type: Date, default: null }
}, { timestamps: true });

const Atividade = mongoose.model('Atividade', atividadeSchema);

export default Atividade;
