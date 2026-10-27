import mongoose from "mongoose";

// Missão = treino ou missão que a fono atribui a um paciente (lista de palavras + conclusão).
// Não confundir com a "Atividade" da Carol (prescrição: fonema, posição, frequência, tempo de prática).
const missaoSchema = new mongoose.Schema({
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    tipo: { type: String, enum: ["treino", "missao"], required: true },
    titulo: { type: String, trim: true, maxlength: 80 },
    palavras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Palavra" }],
    concluida_em: { type: Date, default: null }
}, { timestamps: true });

const Missao = mongoose.model('Missao', missaoSchema, 'missoes'); // 3º argumento: nome da coleção (o plural automático daria "missaos")

export default Missao;
