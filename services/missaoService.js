import Missao from "../models/Missao.js";

class missaoService {
    async Create(id_fono, id_paciente, tipo, titulo, palavras) {
        const nova = new Missao({ id_fono, id_paciente, tipo, titulo, palavras });
        return await nova.save();
    }

    async getAllDaFono(id_fono, id_paciente, apenasPendentes) {
        const filtro = { id_fono };
        if (id_paciente) filtro.id_paciente = id_paciente;
        if (apenasPendentes) filtro.concluida_em = null;
        return await Missao.find(filtro).sort({ createdAt: -1 });
    }

    // as mais antigas primeiro: a criança faz na ordem em que a fono mandou
    async getPendentesDoPaciente(id_paciente) {
        return await Missao.find({ id_paciente, concluida_em: null }).sort({ createdAt: 1 });
    }

    async getOne(id) {
        return await Missao.findById(id);
    }

    async delete(id) {
        await Missao.findByIdAndDelete(id);
    }

    // atômico: só conclui se ainda não estava concluída (evita pagar a recompensa duas vezes)
    async concluir(id) {
        return await Missao.findOneAndUpdate(
            { _id: id, concluida_em: null },
            { concluida_em: new Date() },
            { returnDocument: "after" }
        );
    }
};

export default new missaoService();
