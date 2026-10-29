import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    categoria: { type: String, enum: ["camiseta", "calca", "calcado"], required: true },
    imagem_url: String,
    preco: { type: Number, required: true, min: 0 }
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
