import Nivel from "../models/Nivel.js";

class nivelService {
    async getAll() {
        return await Nivel.find({}).sort({ numero: 1 });
    }

    async getByNumero(numero) {
        return await Nivel.findOne({ numero });
    }
};

export default new nivelService();