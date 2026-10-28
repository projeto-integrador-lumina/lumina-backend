import itemService from "../services/itemService.js";
import pacienteService from "../services/pacienteService.js";
import { idValido } from "../utils/acesso.js";

const SLOTS = ["camiseta", "calca", "calcado"];

const pacienteLogado = (req) => pacienteService.getOne(req.loggedUser.idPaciente);

const getLoja = async (req, res) => {
    try {
        const { categoria } = req.query;
        if (categoria && !SLOTS.includes(categoria)) {
            return res.status(400).json({error: `categoria deve ser: ${SLOTS.join(", ")}.`});
        }
        const paciente = await pacienteLogado(req);
        const meus = new Set(paciente.inventario.map(String));
        const itens = await itemService.getAll(categoria);

        res.status(200).json({
            moedas: paciente.moedas,
            itens: itens.map((i) => ({
                _id: i._id, nome: i.nome, categoria: i.categoria, imagem_url: i.imagem_url, preco: i.preco,
                comprado: meus.has(String(i._id))
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar a loja."});
    }
};

const comprarItem = async (req, res) => {
    try {
        const { id_item } = req.body;
        if (!idValido(id_item)) return res.status(400).json({error: "id_item inválido."});

        const item = await itemService.getOne(id_item);
        if (!item) return res.status(404).json({error: "Item não encontrado."});

        const paciente = await pacienteLogado(req);
        if (paciente.inventario.some((i) => String(i) === String(item._id))) {
            return res.status(409).json({error: "Você já tem esse item."});
        }

        const atualizado = await pacienteService.comprar(paciente._id, item._id, item.preco);
        if (!atualizado) {
            const agora = await pacienteLogado(req);
            const jaTem = agora.inventario.some((i) => String(i) === String(item._id));
            return jaTem
                ? res.status(409).json({error: "Você já tem esse item."})
                : res.status(400).json({error: "Moedas insuficientes."});
        }

        res.status(200).json({message: `Você comprou: ${item.nome}!`, moedas: atualizado.moedas});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao comprar item."});
    }
};

const getInventario = async (req, res) => {
    try {
        const paciente = await pacienteLogado(req);
        const itens = await itemService.getByIds(paciente.inventario);
        const porId = new Map(itens.map((i) => [String(i._id), i]));
        const slot = (id) => (id ? porId.get(String(id)) || null : null);

        res.status(200).json({
            moedas: paciente.moedas,
            itens,
            avatar: {
                genero: paciente.avatar.genero,
                camiseta: slot(paciente.avatar.camiseta),
                calca: slot(paciente.avatar.calca),
                calcado: slot(paciente.avatar.calcado)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar inventário."});
    }
};

const updateAvatar = async (req, res) => {
    try {
        const paciente = await pacienteLogado(req);
        const meus = new Set(paciente.inventario.map(String));
        const campos = {};

        if (req.body.genero !== undefined) {
            if (!["F", "M"].includes(req.body.genero)) return res.status(400).json({error: 'genero deve ser "F" ou "M".'});
            campos["avatar.genero"] = req.body.genero;
        }

        for (const slot of SLOTS) {
            const valor = req.body[slot];
            if (valor === undefined) continue;
            if (valor === null) {
                campos["avatar." + slot] = null;
                continue;
            }
            if (!idValido(valor)) return res.status(400).json({error: `${slot}: id inválido.`});
            if (!meus.has(valor)) return res.status(403).json({error: `Você ainda não tem esse item (${slot}).`});

            const [item] = await itemService.getByIds([valor]);
            if (!item || item.categoria !== slot) {
                return res.status(400).json({error: `Esse item não é da categoria "${slot}".`});
            }
            campos["avatar." + slot] = item._id;
        }

        if (!Object.keys(campos).length) return res.status(400).json({error: "Nada para alterar."});

        await pacienteService.setCampos(paciente._id, campos);
        res.status(200).json({message: "Avatar atualizado!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao atualizar avatar."});
    }
};

export default { getLoja, comprarItem, getInventario, updateAvatar };
