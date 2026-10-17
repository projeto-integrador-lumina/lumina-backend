import Paciente from "../models/Paciente.js";
import usuarioService from "./usuarioService.js";

class pacienteService {
    async getAll(id_fono) {
        return await Paciente.find({ id_fono, ativo: true }).sort({ nome: 1 });
    }

    async Create(nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, id_fono, id_login) {
        const newPaciente = new Paciente({ nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, id_fono, id_login });
        return await newPaciente.save();
    }

    async delete(id) {
        const paciente = await Paciente.findByIdAndUpdate(id, { ativo: false });
        if (paciente) {
            await usuarioService.setAtivo(paciente.id_login, false);
        }
    }

    async update(id, nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel) {
        return await Paciente.findByIdAndUpdate(
            id,
            { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel }, // undefined é ignorado
            { returnDocument: "after", runValidators: true }
        );
    }

    async getOne(id) {
        return await Paciente.findById(id);
    }

    async getByLogin(id_login) {
        return await Paciente.findOne({ id_login });
    }
};

export default new pacienteService();