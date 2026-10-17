import Fonoaudiologo from "../models/Fonoaudiologo.js";

class fonoaudiologoService {
    async Create(nome, email, crfa, telefone, foto_perfil, id_login) {
        const newFono = new Fonoaudiologo({ nome, email, crfa, telefone, foto_perfil, id_login });
        return await newFono.save();
    }

    async getOne(id) {
        return await Fonoaudiologo.findById(id);
    }

    async getByLogin(id_login) {
        return await Fonoaudiologo.findOne({ id_login });
    }

    async getByCrfaOrEmail(crfa, email) {
        return await Fonoaudiologo.findOne({ $or: [{ crfa }, { email }] });
    }

    async update(id, nome, email, crfa, telefone, foto_perfil) {
        return await Fonoaudiologo.findByIdAndUpdate(
            id,
            { nome, email, crfa, telefone, foto_perfil }, 
            { returnDocument: "after", runValidators: true }
        );
    }
};

export default new fonoaudiologoService();