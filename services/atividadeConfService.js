import Atividade from "../models/Atividade.js";

class atividadeConfService {
    async Create(id_fono, id_paciente, tipo, titulo, palavras) {
        const nova = new Atividade({ id_fono, id_paciente, tipo, titulo, palavras });
        return await nova.save();
    }

    async getAllDaFono(id_fono, id_paciente, apenasPendentes) {
        const filtro = { id_fono };
        if (id_paciente) filtro.id_paciente = id_paciente;
        if (apenasPendentes) filtro.concluida_em = null;
        return await Atividade.find(filtro).sort({ createdAt: -1 });
    }

    async getPendentesDoPaciente(id_paciente) {
        return await Atividade.find({ id_paciente, concluida_em: null }).sort({ createdAt: 1 });
    }

    async getOne(id) {
        return await Atividade.findById(id);
    }

    async delete(id) {
        await Atividade.findByIdAndDelete(id);
    }

    async concluir(id) {
        return await Atividade.findOneAndUpdate(
            { _id: id, concluida_em: null },
            { concluida_em: new Date() },
            { returnDocument: "after" }
        );
    }
};

export default new atividadeService();
