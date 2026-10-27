import Usuario from "../models/Usuario.js";

// Obs.: os services NÃO capturam erro (sem try/catch).
// Quem captura é o controller, que responde 400/500 de acordo.
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

    // hard delete: usado só para desfazer um login quando o cadastro do perfil falha
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
