import Tentativa from "../models/Tentativa.js";

const SO_FALA = { $ne: "escolha" };

class tentativaService {
    async Create(dados) {
        const nova = new Tentativa(dados);
        return await nova.save();
    }

    async jaAcertou(id_paciente, id_palavra) {
        return (await Tentativa.countDocuments({ id_paciente, id_palavra, acertou: true, tipo: SO_FALA })) > 0;
    }

    async palavrasAcertadas(id_paciente) {
        return await Tentativa.distinct("id_palavra", { id_paciente, acertou: true, tipo: SO_FALA });
    }

    async palavrasAcertadasDesde(id_paciente, ids_palavras, inicio) {
        return await Tentativa.distinct("id_palavra", {
            id_paciente,
            acertou: true,
            tipo: SO_FALA,
            id_palavra: { $in: ids_palavras },
            createdAt: { $gte: inicio }
        });
    }

    async getDesde(id_paciente, inicio) {
        return await Tentativa.find({ id_paciente, createdAt: { $gte: inicio } });
    }

    async getDoPaciente(id_paciente) {
        return await Tentativa.find({ id_paciente });
    }

    async getPorPeriodo(ids_pacientes, inicio, fim) {
        if (!ids_pacientes.length) return [];
        return await Tentativa.find({
            id_paciente: { $in: ids_pacientes },
            createdAt: { $gte: inicio, $lt: fim }
        });
    }
};

export default new tentativaService();
