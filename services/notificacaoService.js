import Notificacao from "../models/Notificacao.js";

class notificacaoService {
    async Create(id_paciente, tipo, texto) {
        const nova = new Notificacao({ id_paciente, tipo, texto });
        return await nova.save();
    }

    async getAll(id_paciente) {
        return await Notificacao.find({ id_paciente }).sort({ createdAt: -1 }).limit(50);
    }

    async contarNaoLidas(id_paciente) {
        return await Notificacao.countDocuments({ id_paciente, lida: false });
    }

    async marcarLidas(id_paciente) {
        await Notificacao.updateMany({ id_paciente, lida: false }, { lida: true });
    }

    async limpar(id_paciente) {
        await Notificacao.deleteMany({ id_paciente });
    }
};

export default new notificacaoService();
