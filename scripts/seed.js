// Carga inicial do conteúdo do jogo. Pode rodar várias vezes (não duplica):
//   npm run seed        (adicione em package.json: "seed": "node scripts/seed.js")
//
// As URLs de imagem/áudio abaixo são PLACEHOLDERS: troque pelos caminhos reais dos assets.
import mongoose from "../config/db-connection.js";
import Palavra from "../models/Palavra.js";
import Nivel from "../models/Nivel.js";
import Item from "../models/Item.js";

// Catálogo = tudo o que aparece no PWA. Fonema/categoria são sugestões: confirme com a fonoaudióloga.
const palavras = [
    { texto: "touro", silabas: ["TOU", "RO"], fonema: "/r/", categoria_som: "liquido" },
    { texto: "cerca", silabas: ["CER", "CA"], fonema: "/s/", categoria_som: "fricativo" },
    { texto: "peru",  silabas: ["PE", "RU"],  fonema: "/r/", categoria_som: "liquido" },
    // usadas nas opções do exercício de escolher a imagem (não são palavras do nível 1)
    { texto: "vaca",  silabas: ["VA", "CA"],  fonema: "/v/", categoria_som: "fricativo" },
    { texto: "pato",  silabas: ["PA", "TO"],  fonema: "/p/", categoria_som: "explosivo" },
    { texto: "sapo",  silabas: ["SA", "PO"],  fonema: "/s/", categoria_som: "fricativo" }
].map((p) => ({
    ...p,
    imagem_url: `/assets/palavras/${p.texto}.png`,
    audio_url: `/assets/audios/${p.texto}.mp3`
}));

const itens = [
    { nome: "Camiseta regata",  categoria: "camiseta", preco: 20 },
    { nome: "Cropped preto",    categoria: "camiseta", preco: 25 },
    { nome: "Cropped lolá",     categoria: "camiseta", preco: 40 },
    { nome: "Camiseta coração", categoria: "camiseta", preco: 30 },
    { nome: "Calça mom",        categoria: "calca",    preco: 30 },
    { nome: "Saia",             categoria: "calca",    preco: 25 },
    { nome: "Calça preta",      categoria: "calca",    preco: 30 },
    { nome: "Shorts jeans",     categoria: "calca",    preco: 25 },
    { nome: "Tênis azul",       categoria: "calcado",  preco: 35 },
    { nome: "Chinelo",          categoria: "calcado",  preco: 15 },
    { nome: "Sapatilha",        categoria: "calcado",  preco: 30 },
    { nome: "Tênis salmão",     categoria: "calcado",  preco: 35 }
].map((i) => ({ ...i, imagem_url: `/assets/itens/${i.nome.toLowerCase().replace(/\s+/g, "-")}.png` }));

const run = async () => {
    for (const p of palavras) {
        await Palavra.findOneAndUpdate({ texto: p.texto }, p, { upsert: true });
    }

    const docs = await Palavra.find({ texto: { $in: palavras.map((p) => p.texto) } });
    const NIVEL_1 = ["touro", "cerca", "peru"]; // palavras de fala do nível 1, na ordem do jogo
    const ids = NIVEL_1.map((texto) => docs.find((d) => d.texto === texto)._id); // mantém a ordem
    await Nivel.findOneAndUpdate({ numero: 1 }, { numero: 1, nome: "A fazenda", palavras: ids }, { upsert: true });

    for (const i of itens) {
        await Item.findOneAndUpdate({ nome: i.nome }, i, { upsert: true });
    }

    console.log(`Seed concluído: ${palavras.length} palavras, 1 nível (${NIVEL_1.length} palavras), ${itens.length} itens.`);
    await mongoose.disconnect();
};

run().catch((error) => {
    console.log("Erro no seed: " + error);
    process.exit(1);
});
