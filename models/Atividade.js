import mongoose from "mongoose";
export const POSICOES = ["inicial", "medial", "final"];

const atividadeSchema = new mongoose.Schema({
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    fonemas: {
        type: [{ type: String, trim: true }],
        validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: "Informe ao menos um fonema." }
    },
    posicoes: { type: [{ type: String, enum: POSICOES }], default: [] },
    dias_semana: {
        type: [Number],
        default: [],
        validate: { validator: (v) => v.every((n) => Number.isInteger(n) && n >= 0 && n <= 6), message: "dias_semana deve conter números de 0 a 6." }
    },
    tempo_pratica: { type: Number, min: 1 }
}, { timestamps: true });

const Atividade = mongoose.model('Atividade', atividadeSchema);

export default Atividade;