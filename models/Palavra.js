import mongoose from "mongoose";

const palavraSchema = new mongoose.Schema({
    texto: { type: String, required: true, unique: true, trim: true },       // "touro"
    silabas: { type: [String], required: true, validate: v => v.length > 0 }, // ["TOU","RO"]
    imagem_url: String,
    audio_url: String,
    fonema: String,                                                           // "/r/"
    categoria_som: { type: String, enum: ["liquido", "explosivo", "nasal", "fricativo"] }
});

const Palavra = mongoose.model('Palavra', palavraSchema);

export default Palavra;
