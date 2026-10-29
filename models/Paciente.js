import mongoose from "mongoose";


const responsavelSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    contato: String,
    cpf: String
}, { _id: false })

const pacienteSchema = new mongoose.Schema({
    id_fono: { type: mongoose.Schema.Types.ObjectId, ref: "Fonoaudiologo", required: true, index: true },
    id_login: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true },

    nome: { type: String, required: true, trim: true },
    sobrenome: { type: String, required: true, trim: true },
    data_nasc: { type: Date, required: true },
    sexo: String,
    nivel_gravidade: String,
    foto_perfil: String,
    endereco: String,
    ativo: { type: Boolean, default: true },
    responsavel: { type: responsavelSchema, required: true },
    alvo_atual: String, 
    pin_responsavel: { type: String, select: false },
    pin_tentativas: { type: Number, default: 0 },
    pin_bloqueado_ate: Date,
    xp: { type: Number, default: 0 },
    moedas: { type: Number, default: 0 },
    inventario: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    avatar: {
        genero: { type: String, enum: ["F", "M"], default: "F" },
        camiseta: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
        calca: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
        calcado: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null }
    },
    preferencias: {
        som_ligado: { type: Boolean, default: true },
        volume: { type: Number, min: 0, max: 100, default: 80 },
        narracao: { type: Boolean, default: true },
        alto_contraste: { type: Boolean, default: false }
    }
}, {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.pin_responsavel; return ret; } } // nunca sai em resposta
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

export default Paciente;
