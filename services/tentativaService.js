import Tentativa from "../models/Tentativa.js";

// Níveis e missoes só avançam com acertos de FALA (o exercício de escolher a imagem
// é um palpite entre opções, então dá xp mas não passa de fase). $ne também vale para
// tentativas antigas, que não têm o campo "tipo".
const SO_FALA = { $ne: "escolha" };

class tentativaService {
    async Create(dados) {
        const nova = new Tentativa(dados);
        return await nova.save();
    }

    async jaAcertou(id_paciente, id_palavra) {
        return (await Tentativa.countDocuments({ id_paciente, id_palavra, acertou: true, tipo: SO_FALA })) > 0;
    }

    // ids das palavras que o paciente já acertou ao menos uma vez
    async palavrasAcertadas(id_paciente) {
        return await Tentativa.distinct("id_palavra", { id_paciente, acertou: true, tipo: SO_FALA });
    }

    // acertos feitos a partir de "inicio" (usado para conferir se uma missao foi cumprida)
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

    // vários pacientes, intervalo [inicio, fim)
    async getPorPeriodo(ids_pacientes, inicio, fim) {
        if (!ids_pacientes.length) return [];
        return await Tentativa.find({
            id_paciente: { $in: ids_pacientes },
            createdAt: { $gte: inicio, $lt: fim }
        });
    }
};

export default new tentativaService();
