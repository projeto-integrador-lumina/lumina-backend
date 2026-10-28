import Palavra from "../models/Palavra.js";

class palavraService {
    async getAll(fonema, categoria_som) {
        const filtro = {};
        if (fonema) filtro.fonema = fonema;
        if (categoria_som) filtro.categoria_som = categoria_som;
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
