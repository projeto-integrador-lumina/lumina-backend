import Mensagem from "../models/Mensagem.js";

class mensagemService {
    async Create(id_paciente, id_fono, autor, texto) {
        const nova = new Mensagem({ id_paciente, id_fono, autor, texto });
        return await nova.save();
    }

    // últimas 200 mensagens, da mais antiga para a mais nova
    async getConversa(id_paciente) {
        const msgs = await Mensagem.find({ id_paciente }).sort({ createdAt: -1 }).limit(200);
        return msgs.reverse();
    }

    // marca como lidas as mensagens ESCRITAS por "autor"
    async marcarLidas(id_paciente, autor) {
        await Mensagem.updateMany({ id_paciente, autor, lida: false }, { lida: true });
    }

    async contarNaoLidas(id_paciente, autor) {
        return await Mensagem.countDocuments({ id_paciente, autor, lida: false });
    }

    // última mensagem e não lidas (do responsável) por paciente, para a lista de conversas da fono
    async resumoDaFono(id_fono) {
        const msgs = await Mensagem.find({ id_fono }).sort({ createdAt: -1 }).limit(2000);
        const resumo = new Map();
        for (const m of msgs) {
            const chave = String(m.id_paciente);
            if (!resumo.has(chave)) resumo.set(chave, { ultima: m, nao_lidas: 0 });
            if (m.autor === "responsavel" && !m.lida) resumo.get(chave).nao_lidas++;
        }
        return resumo;
    }
};

export default new mensagemService();
