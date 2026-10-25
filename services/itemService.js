import Item from "../models/Item.js";

class itemService {
    async getAll(categoria) {
        const filtro = categoria ? { categoria } : {};
        return await Item.find(filtro).sort({ preco: 1 });
    }

    async getByIds(ids) {
        if (!ids.length) return [];
        return await Item.find({ _id: { $in: ids } });
    }

    async getOne(id) {
        return await Item.findById(id);
    }
};

export default new itemService();