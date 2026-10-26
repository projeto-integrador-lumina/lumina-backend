import Conversa from "../models/Conversa.js";
import Mensagem from "../models/Mensagem.js";

class mensagemService {
    // ---------- Conversas ----------
    async getConversas(filtro = {}) {
        return await Conversa.find(filtro).sort({ ultima_mensagem_em: -1, createdAt: -1 });
    }

    async getConversa(id) {
        return await Conversa.findById(id);
    }

    async getConversaDaDupla(id_fono, id_paciente) {
        return await Conversa.findOne({ id_fono, id_paciente });
    }

    async CreateConversa(id_fono, id_paciente) {
        const newConversa = new Conversa({ id_fono, id_paciente });
        return await newConversa.save();
    }

    // ---------- Mensagens ----------
    async getMensagens(id_conversa) {
        return await Mensagem.find({ id_conversa }).sort({ createdAt: 1 });
    }

    async getMensagem(id) {
        return await Mensagem.findById(id);
    }

    // salva a mensagem e atualiza a "ultimaMensagem" da conversa
    async CreateMensagem(id_conversa, remetente, conteudo) {
        const newMensagem = new Mensagem({ id_conversa, remetente, conteudo });
        const mensagem = await newMensagem.save();
        await Conversa.findByIdAndUpdate(id_conversa, {
            ultima_mensagem: mensagem.conteudo,
            ultima_mensagem_em: mensagem.createdAt
        });
        return mensagem;
    }

    async marcarLida(id) {
        return await Mensagem.findByIdAndUpdate(id, { lida: true }, { returnDocument: "after" });
    }

    // apaga a mensagem e recalcula a última mensagem da conversa
    async deleteMensagem(id) {
        const mensagem = await Mensagem.findByIdAndDelete(id);
        if (mensagem) {
            const ultima = await Mensagem.findOne({ id_conversa: mensagem.id_conversa }).sort({ createdAt: -1 });
            await Conversa.findByIdAndUpdate(mensagem.id_conversa, {
                ultima_mensagem: ultima ? ultima.conteudo : "",
                ultima_mensagem_em: ultima ? ultima.createdAt : null
            });
        }
    }
};

export default new mensagemService();