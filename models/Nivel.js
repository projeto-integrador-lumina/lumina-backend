import mongoose from "mongoose";

const nivelSchema = new mongoose.Schema({
    numero: { type: Number, required: true, unique: true },
    nome: { type: String, required: true },                                   // "A fazenda"
    palavras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Palavra" }]
});

const Nivel = mongoose.model('Nivel', nivelSchema);

export default Nivel;
