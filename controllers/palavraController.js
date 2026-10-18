import palavraService from "../services/palavraService.js";
import { CATEGORIAS } from "../utils/jogo.js";

const getAllPalavra = async (req, res) => {
    try {
        const { fonema, categoria_som } = req.query;
        if (categoria_som && !CATEGORIAS.includes(categoria_som)) {
            return res.status(400).json({error: `categoria_som deve ser: ${CATEGORIAS.join(", ")}.`});
        }
        const palavras = await palavraService.getAll(fonema, categoria_som);
        res.status(200).json({palavras});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar palavras."});
    }
};

export default { getAllPalavra };