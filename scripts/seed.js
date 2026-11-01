import mongoose from "../config/db-connection.js";
import Palavra from "../models/Palavra.js";
import Nivel from "../models/Nivel.js";
import Item from "../models/Item.js";
import Usuario from "../models/Usuario.js";
import Fonoaudiologo from "../models/Fonoaudiologo.js";
import Paciente from "../models/Paciente.js";
import Tentativa from "../models/Tentativa.js";
import bcrypt from "bcrypt";
import { createHash } from "node:crypto";

const palavras = [
    { texto: "touro", silabas: ["TOU", "RO"], fonema: "/r/", posicao_fonema: "medial",  categoria_som: "liquido" },
    { texto: "cerca", silabas: ["CER", "CA"], fonema: "/r/", posicao_fonema: "medial",  categoria_som: "liquido" },
    { texto: "peru",  silabas: ["PE", "RU"],  fonema: "/r/", posicao_fonema: "medial",  categoria_som: "liquido" },
    { texto: "vaca",  silabas: ["VA", "CA"],  fonema: "/v/", posicao_fonema: "inicial", categoria_som: "fricativo" },
    { texto: "pato",  silabas: ["PA", "TO"],  fonema: "/p/", posicao_fonema: "inicial", categoria_som: "explosivo" },
    { texto: "sapo",  silabas: ["SA", "PO"],  fonema: "/s/", posicao_fonema: "inicial", categoria_som: "fricativo" }
].map((p) => ({
    ...p,
    imagem_url: `/assets/${p.texto}.png`,
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


// O seed demonstrativo é opt-in e não apaga documentos existentes.
// Identificadores estáveis permitem executar novamente sem duplicar tentativas.
const DEMO_NAMESPACE = "lola-relatorios-demo-v1";
const DEMO_FONO_USUARIO = "lola.demo.fono";
const DEMO_FONO_EMAIL = "lola.demo.fono@example.test";
const DEMO_FONO_CRFA = "DEMO-RELATORIOS-001";

function idEstavel(chave) {
    return new mongoose.Types.ObjectId(
        createHash("sha256").update(`${DEMO_NAMESPACE}:${chave}`).digest("hex").slice(0, 24)
    );
}

function inteiroAleatorio(chave, maximo) {
    const hex = createHash("sha256").update(`${DEMO_NAMESPACE}:${chave}`).digest("hex").slice(0, 8);
    return parseInt(hex, 16) % maximo;
}

const pacientesDemo = [
    { codigo: "joao", nome: "João", sobrenome: "Exemplo", nascimento: "2017-05-12", sexo: "M", base: 40, ganho: 8, frequencia: 5 },
    { codigo: "ana", nome: "Ana", sobrenome: "Exemplo", nascimento: "2018-02-21", sexo: "F", base: 62, ganho: 4, frequencia: 4 },
    { codigo: "pedro", nome: "Pedro", sobrenome: "Exemplo", nascimento: "2016-11-08", sexo: "M", base: 50, ganho: 2, frequencia: 3 },
    { codigo: "lara", nome: "Lara", sobrenome: "Exemplo", nascimento: "2019-07-15", sexo: "F", base: 76, ganho: 1, frequencia: 2 },
];

async function seedRelatoriosDemo() {
    const senha = process.env.SEED_DEMO_PASSWORD;
    if (!senha || senha.length < 8) {
        throw new Error("Para criar os dados demonstrativos, defina SEED_DEMO_PASSWORD com pelo menos 8 caracteres.");
    }

    // Garante que o usuário de demonstração nunca substitua uma conta real.
    const idLoginFono = idEstavel("usuario:fono");
    const usuarioExistente = await Usuario.findOne({ usuario: DEMO_FONO_USUARIO });
    if (usuarioExistente && String(usuarioExistente._id) !== String(idLoginFono)) {
        throw new Error(`O login ${DEMO_FONO_USUARIO} já existe fora deste seed. Operação interrompida.`);
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await Usuario.updateOne(
        { _id: idLoginFono },
        { $setOnInsert: { _id: idLoginFono, usuario: DEMO_FONO_USUARIO, senha: senhaHash, tipo: "Fono", ativo: true } },
        { upsert: true, runValidators: true }
    );

    const idFono = idEstavel("fono");
    const fonoExistente = await Fonoaudiologo.findOne({ $or: [{ email: DEMO_FONO_EMAIL }, { crfa: DEMO_FONO_CRFA }] });
    if (fonoExistente && String(fonoExistente._id) !== String(idFono)) {
        throw new Error("A fonoaudióloga demonstrativa conflita com um cadastro existente.");
    }
    await Fonoaudiologo.updateOne(
        { _id: idFono },
        { $setOnInsert: {
            _id: idFono, id_login: idLoginFono, nome: "Fono Demonstrativa",
            email: DEMO_FONO_EMAIL, crfa: DEMO_FONO_CRFA, telefone: "00000000000"
        } },
        { upsert: true, runValidators: true }
    );

    const pacientesCriados = [];
    for (const p of pacientesDemo) {
        const idLogin = idEstavel(`usuario:${p.codigo}`);
        const idPaciente = idEstavel(`paciente:${p.codigo}`);
        const login = `lola.demo.${p.codigo}`;
        const usuarioComMesmoLogin = await Usuario.findOne({ usuario: login });
        if (usuarioComMesmoLogin && String(usuarioComMesmoLogin._id) !== String(idLogin)) {
            throw new Error(`Login de demonstração já utilizado por outro cadastro: ${login}`);
        }
        await Usuario.updateOne(
            { _id: idLogin },
            { $setOnInsert: { _id: idLogin, usuario: login, senha: senhaHash, tipo: "Paciente", ativo: true } },
            { upsert: true, runValidators: true }
        );
        await Paciente.updateOne(
            { _id: idPaciente },
            { $setOnInsert: {
                _id: idPaciente, id_fono: idFono, id_login: idLogin,
                nome: p.nome, sobrenome: p.sobrenome, data_nasc: new Date(`${p.nascimento}T12:00:00Z`),
                sexo: p.sexo, ativo: true, nivel_gravidade: "Demonstração",
                responsavel: { nome: "Responsável Exemplo", contato: "00000000000" },
                alvo_atual: "/r/"
            } },
            { upsert: true, runValidators: true }
        );
        pacientesCriados.push({ ...p, idPaciente });
    }

    const palavrasDemo = await Palavra.find({ texto: { $in: palavras.map((p) => p.texto) } }).lean();
    if (palavrasDemo.length !== palavras.length) {
        throw new Error("Nem todas as palavras de demonstração foram encontradas.");
    }

    // Segunda-feira da semana atual em UTC, para gerar seis semanas de histórico.
    const hoje = new Date();
    const hojeUTC = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
    const diaSemana = (hojeUTC.getUTCDay() + 6) % 7;
    const segundaAtual = new Date(hojeUTC.getTime() - diaSemana * 86400000);
    const inicio = new Date(segundaAtual.getTime() - 5 * 7 * 86400000);
    const operacoes = [];

    for (const paciente of pacientesCriados) {
        for (let semana = 0; semana < 6; semana++) {
            for (let dia = 0; dia < paciente.frequencia; dia++) {
                // Dias 0..6; na semana atual, não cria registros futuros.
                const deslocamento = Math.floor((dia * 7) / paciente.frequencia);
                const data = new Date(inicio.getTime() + (semana * 7 + deslocamento) * 86400000);
                if (data > hojeUTC) continue;
                const qtd = 7 + inteiroAleatorio(`${paciente.codigo}:${semana}:${dia}:qtd`, 6);

                for (let n = 0; n < qtd; n++) {
                    const chave = `${paciente.codigo}:${semana}:${dia}:${n}`;
                    const palavra = palavrasDemo[inteiroAleatorio(`${chave}:palavra`, palavrasDemo.length)];
                    // /r/ tem maior dificuldade; /p/ e /v/ tendem a ter mais acertos.
                    const ajusteFonema = { "/r/": -15, "/s/": -7, "/v/": 9, "/p/": 12 }[palavra.fonema] ?? 0;
                    const chance = Math.max(10, Math.min(95, paciente.base + semana * paciente.ganho + ajusteFonema));
                    const acertou = inteiroAleatorio(`${chave}:acerto`, 100) < chance;
                    const duracao_ms = 120000 + inteiroAleatorio(`${chave}:duracao`, 240001);
                    const horario = new Date(data.getTime() + (13 * 60 + n * 7) * 60000);
                    const idTentativa = idEstavel(`tentativa:${chave}`);
                    operacoes.push({
                        updateOne: {
                            filter: { _id: idTentativa },
                            update: { $set: {
                                id_paciente: paciente.idPaciente,
                                id_palavra: palavra._id,
                                tipo: "fala",
                                silabas: palavra.silabas.map((texto) => ({ texto, acertou })),
                                acertou, duracao_ms,
                                createdAt: horario, updatedAt: horario
                            } },
                            upsert: true
                        }
                    });
                }
            }
        }
    }

    if (operacoes.length) {
        // timestamps: false mantém as datas históricas, inclusive nas reexecuções.
        for (let i = 0; i < operacoes.length; i += 500) {
            await Tentativa.bulkWrite(operacoes.slice(i, i + 500), { ordered: false, timestamps: false });
        }
    }
    console.log(`Relatórios demo: 1 fono, ${pacientesCriados.length} pacientes e ${operacoes.length} tentativas atualizadas/criadas.`);
    console.log(`Login de demonstração: ${DEMO_FONO_USUARIO} (senha definida em SEED_DEMO_PASSWORD).`);
}

const run = async () => {
    for (const p of palavras) {
        await Palavra.findOneAndUpdate({ texto: p.texto }, p, { upsert: true, runValidators: true });
    }

    const docs = await Palavra.find({ texto: { $in: palavras.map((p) => p.texto) } });
    const NIVEL_1 = ["touro", "cerca", "peru"]; 
    const ids = NIVEL_1.map((texto) => docs.find((d) => d.texto === texto)._id); 
    await Nivel.findOneAndUpdate({ numero: 1 }, { numero: 1, nome: "A fazenda", palavras: ids }, { upsert: true });

    for (const i of itens) {
        await Item.findOneAndUpdate({ nome: i.nome }, i, { upsert: true, runValidators: true });
    }

    if (process.env.SEED_DEMO_REPORTS === "true") {
        await seedRelatoriosDemo();
    }

    console.log(`Seed concluído: ${palavras.length} palavras, 1 nível (${NIVEL_1.length} palavras), ${itens.length} itens.`);
    await mongoose.disconnect();
};

run().catch((error) => {
    console.log("Erro no seed: " + error);
    process.exit(1);
});