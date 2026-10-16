import Paciente from "../models/Paciente.js";

class pacienteService {
    async getAll() {
        try {
            const pacientes = await Paciente.find();
            return pacientes;
        } catch (error) {
            console.log(error);
        }
    }

    async Create(nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel, pacienteId) {
        try {
            const newPaciente = new Paciente({ nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel, pacienteId });
            await newPaciente.save();
        } catch (error) { 
            console.log(error);
        }
    }

    async delete(id) {
        try {
            await Paciente.findByIdAndDelete(id);
            console.log(`Paciente com ID ${id} deletado com sucesso!`);
        } catch (error) {
            console.log(error);
        }
    }

    async update(id, nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel) {
        try {
            await Paciente.findByIdAndUpdate(id, { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel });
            console.log(`Paciente com ID ${id} atualizado com sucesso!`);
        } catch (error) {
            console.log(error);
        }
    }

    async getOne(id) {
        try {
            const paciente = await Paciente.findById({ _id: id });
            return paciente;
        } catch (error) {
            console.log(error);
        }
    };
};

export default new pacienteService();