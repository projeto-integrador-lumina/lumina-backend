import Usuario from "../models/Usuario.js";

class usuarioService {
    async getOne(usuario) {
        return await Usuario.findOne({ usuario });
    }

    async getById(id) {
        return await Usuario.findById(id);
    }

    async Create(usuario, senha, tipo, precisa_trocar_senha = false) {
        const newUsuario = new Usuario({ usuario, senha, tipo, precisa_trocar_senha });
        return await newUsuario.save();
    }

    async delete(id) {
        await Usuario.findByIdAndDelete(id);
    }

    async updateSenha(id, senha, precisa_trocar_senha) {
        await Usuario.findByIdAndUpdate(id, { senha, precisa_trocar_senha });
    }

    async setAtivo(id, ativo) {
        await Usuario.findByIdAndUpdate(id, { ativo });
    }
};

export default new usuarioService();