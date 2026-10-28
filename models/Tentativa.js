import mongoose from "mongoose";

const silabaSchema = new mongoose.Schema({
    texto: String,
    acertou: Boolean
}, { _id: false });

const tentativaSchema = new mongoose.Schema({
    id_paciente: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true },
    id_palavra: { type: mongoose.Schema.Types.ObjectId, ref: "Palavra", required: true },
    id_atividade: { type: mongoose.Schema.Types.ObjectId, ref: "Atividade", default: null },
    tipo: { type: String, enum: ["fala", "escolha"], default: "fala" },
    silabas: [silabaSchema],                                                
    id_escolhida: { type: mongoose.Schema.Types.ObjectId, ref: "Palavra", default: null }, 
    acertou: { type: Boolean, required: true },
    duracao_ms: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

tentativaSchema.index({ id_paciente: 1, createdAt: -1 });

const Tentativa = mongoose.model('Tentativa', tentativaSchema);

export default Tentativa;
