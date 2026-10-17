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
}, { 
    timestamps: true 
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

export default Paciente;