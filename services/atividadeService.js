import Atividade from "../models/Atividade.js";

class atividadeService {
    async getAll(filtro = {}) {
        return await Atividade.find(filtro).sort({ createdAt: -1 });
    }

    async getOne(id) {
        return await Atividade.findById(id);
    }

    async Create(id_paciente, id_fono, dados) {
        const nova = new Atividade({ id_paciente, id_fono, ...dados });
        return await nova.save();
    }

    async update(id, dados) {
        return await Atividade.findByIdAndUpdate(
            id,
            { $set: dados },
            { returnDocument: "after", runValidators: true }
        );
    }

    async delete(id) {
        await Atividade.findByIdAndDelete(id);
    }
};

export default new atividadeService();