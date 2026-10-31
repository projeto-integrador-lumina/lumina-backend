import Palavra from "../models/Palavra.js";

class palavraService {
    async getAll(fonema, categoria_som, posicao_fonema) {
        const filtro = {};
        if (fonema) filtro.fonema = fonema;
        if (categoria_som) filtro.categoria_som = categoria_som;
        if (posicao_fonema) filtro.posicao_fonema = posicao_fonema;
        return await Palavra.find(filtro).sort({ texto: 1 });
    }

    async buscar({ fonemas = [], posicoes = [] } = {}) {
        const filtro = {};
        if (fonemas.length) filtro.fonema = { $in: fonemas };
        if (posicoes.length) filtro.posicao_fonema = { $in: posicoes };
        return await Palavra.find(filtro).sort({ texto: 1 });
    }

    async getByIds(ids) {
        if (!ids.length) return [];
        return await Palavra.find({ _id: { $in: ids } });
    }

    async getOne(id) {
        return await Palavra.findById(id);
    }
};

export default new palavraService();