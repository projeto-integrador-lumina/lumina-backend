import mongoose from "mongoose";

const tarefaSchema = new mongoose.Schema({
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
    tipo: { type: String, enum: ["treino", "missao"], required: true },
    titulo: { type: String, trim: true, maxlength: 80 },
    palavras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Palavra" }],
    concluida_em: { type: Date, default: null }
}, { timestamps: true, collection: "atividadeconfs" }); // mantém a coleção antiga: não precisa migrar dados

const Tarefa = mongoose.model('Tarefa', tarefaSchema);

export default Tarefa;