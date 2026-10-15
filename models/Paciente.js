import mongoose from "mongoose";


const responsavelSchema = new mongoose.Schema({
    nome: String,
    contato: String,
    cpf: String
})

const pacienteSchema = new mongoose.Schema({
    nome: String,
    sobrenome: String,
    endereco: String,
    data_nasc: Date,
    sexo: String,
    nivel_gravidade: String,
    foto_perfil: String,
    ativo: String,
    responsavel: responsavelSchema,
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

export default Paciente;