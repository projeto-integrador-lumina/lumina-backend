import Atividade from "../models/Atividade.js";

class atividadeService {
    async getAll(filtro = {}) {
        return await Atividade.find(filtro).sort({ createdAt: -1 });
    }

    async getOne(id) {
        return await Atividade.findById(id);
    }

    async Create(id_paciente, id_fono, fonema, posicao, frequencia, tempo_pratica) {
        const newAtividade = new Atividade({ id_paciente, id_fono, fonema, posicao, frequencia, tempo_pratica });
        return await newAtividade.save();
    }

    async update(id, fonema, posicao, frequencia, tempo_pratica) {
        return await Atividade.findByIdAndUpdate(
            id,
            { fonema, posicao, frequencia, tempo_pratica },
            { returnDocument: "after", runValidators: true }
        );
    }

    async delete(id) {
        await Atividade.findByIdAndDelete(id);
    }
};

export default new atividadeService();