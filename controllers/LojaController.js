
import itemService from "../services/itemService.js";
import pacienteService from "../services/pacienteService.js";
import { idValido } from "../utils/acesso.js";

const SLOTS = ["camiseta", "calca", "calcado"];

const pacienteLogado = (req) => {
  if (!req.loggedUser?.idPaciente) return null;
  return pacienteService.getOne(req.loggedUser.idPaciente);
};

const getLoja = async (req, res) => {
  try {
    const { categoria } = req.query;

    if (categoria && !SLOTS.includes(categoria)) {
      return res.status(400).json({
        error: `Categoria deve ser: ${SLOTS.join(", ")}.`
      });
    }

    const paciente = await pacienteLogado(req);

    if (!paciente) {
      return res.status(404).json({
        error: "Paciente não encontrado."
      });
    }

    const meus = new Set((paciente.inventario || []).map(String));
    const itens = await itemService.getAll(categoria);

    return res.status(200).json({
      moedas: paciente.moedas ?? 0,
      itens: itens.map((item) => ({
        _id: item._id,
        nome: item.nome,
        categoria: item.categoria,
        imagem_url: item.imagem_url,
        preco: item.preco,
        comprado: meus.has(String(item._id))
      }))
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar a loja."
    });
  }
};

const comprarItem = async (req, res) => {
  try {
    const { id_item } = req.body || {};

    if (!idValido(id_item)) {
      return res.status(400).json({
        error: "Item inválido."
      });
    }

    const item = await itemService.getOne(id_item);

    if (!item) {
      return res.status(404).json({
        error: "Item não encontrado."
      });
    }

    const paciente = await pacienteLogado(req);

    if (!paciente) {
      return res.status(404).json({
        error: "Paciente não encontrado."
      });
    }

    const jaPossui = (paciente.inventario || []).some(
      (id) => String(id) === String(item._id)
    );

    if (jaPossui) {
      return res.status(409).json({
        error: "Você já tem esse item."
      });
    }

    const atualizado = await pacienteService.comprar(
      paciente._id,
      item._id,
      item.preco
    );

    if (!atualizado) {
      const agora = await pacienteLogado(req);

      if (!agora) {
        return res.status(404).json({
          error: "Paciente não encontrado."
        });
      }

      const comprouEnquantoIsso = (agora.inventario || []).some(
        (id) => String(id) === String(item._id)
      );

      if (comprouEnquantoIsso) {
        return res.status(409).json({
          error: "Você já tem esse item."
        });
      }

      return res.status(400).json({
        error: "Moedas insuficientes."
      });
    }

    return res.status(200).json({
      message: `Você comprou: ${item.nome}!`,
      moedas: atualizado.moedas,
      id_item: item._id
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao comprar item."
    });
  }
};

const getInventario = async (req, res) => {
  try {
    const paciente = await pacienteLogado(req);

    if (!paciente) {
      return res.status(404).json({
        error: "Paciente não encontrado."
      });
    }

    const itens = await itemService.getByIds(paciente.inventario || []);
    const porId = new Map(
      itens.map((item) => [String(item._id), item])
    );

    const encontrarItem = (id) => {
      if (!id) return null;
      return porId.get(String(id)) || null;
    };

    const avatar = paciente.avatar || {};

    return res.status(200).json({
      moedas: paciente.moedas ?? 0,
      itens,
      avatar: {
        genero: avatar.genero || "F",
        camiseta: encontrarItem(avatar.camiseta),
        calca: encontrarItem(avatar.calca),
        calcado: encontrarItem(avatar.calcado)
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar inventário."
    });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const paciente = await pacienteLogado(req);

    if (!paciente) {
      return res.status(404).json({
        error: "Paciente não encontrado."
      });
    }

    const corpo = req.body || {};
    const meus = new Set((paciente.inventario || []).map(String));
    const campos = {};

    if (corpo.genero !== undefined) {
      if (!["F", "M"].includes(corpo.genero)) {
        return res.status(400).json({
          error: 'O gênero deve ser "F" ou "M".'
        });
      }

      campos["avatar.genero"] = corpo.genero;
    }

    for (const slot of SLOTS) {
      const valor = corpo[slot];

      if (valor === undefined) continue;

      if (valor === null) {
        campos[`avatar.${slot}`] = null;
        continue;
      }

      if (!idValido(valor)) {
        return res.status(400).json({
          error: `Item inválido para ${slot}.`
        });
      }

      if (!meus.has(String(valor))) {
        return res.status(403).json({
          error: "Você ainda não tem essa roupa."
        });
      }

      const item = await itemService.getOne(valor);

      if (!item || item.categoria !== slot) {
        return res.status(400).json({
          error: "Essa roupa não pertence à categoria selecionada."
        });
      }

      campos[`avatar.${slot}`] = item._id;
    }

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({
        error: "Nenhuma alteração foi enviada."
      });
    }

    await pacienteService.setCampos(paciente._id, campos);

    return res.status(200).json({
      message: "Avatar atualizado!"
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao atualizar avatar."
    });
  }
};

export default {
  getLoja,
  comprarItem,
  getInventario,
  updateAvatar
};
