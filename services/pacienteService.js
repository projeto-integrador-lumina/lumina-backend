
import Paciente from "../models/Paciente.js";
import Item from "../models/Item.js";
import usuarioService from "./usuarioService.js";

const ROUPAS_INICIAIS = [
  "Camiseta regata",
  "Cropped preto",
  "Cropped lolá",
  "Camiseta coração",
  "Calça mom",
  "Saia",
  "Calça preta",
  "Shorts jeans",
  "Tênis azul",
  "Chinelo",
  "Sapatilha",
  "Tênis salmão"
];

class pacienteService {
  async getAll(id_fono, ativo = true) {
    const filtro = { id_fono };

    if (ativo !== null) {
      filtro.ativo = ativo;
    }

    return await Paciente.find(filtro).sort({ nome: 1 });
  }

  async Create(
    nome,
    sobrenome,
    endereco,
    data_nasc,
    sexo,
    nivel_gravidade,
    foto_perfil,
    responsavel,
    id_fono,
    id_login,
    alvo_atual
  ) {
    const itensIniciais = await Item.find({
      nome: { $in: ROUPAS_INICIAIS }
    }).select("_id nome");

    if (itensIniciais.length !== ROUPAS_INICIAIS.length) {
      throw new Error(
        "As roupas iniciais não estão cadastradas. Execute o seed antes de criar pacientes."
      );
    }

    const inventario = itensIniciais.map((item) => item._id);

    const newPaciente = new Paciente({
      nome,
      sobrenome,
      endereco,
      data_nasc,
      sexo,
      nivel_gravidade,
      foto_perfil,
      responsavel,
      id_fono,
      id_login,
      alvo_atual,
      inventario,
      avatar: {
        genero: sexo === "M" ? "M" : "F",
        camiseta: null,
        calca: null,
        calcado: null
      }
    });

    return await newPaciente.save();
  }

  async setAtivo(id, ativo) {
    const paciente = await Paciente.findByIdAndUpdate(id, { ativo });

    if (paciente) {
      await usuarioService.setAtivo(paciente.id_login, ativo);
    }
  }

  async delete(id) {
    await this.setAtivo(id, false);
  }

  async update(
    id,
    nome,
    sobrenome,
    endereco,
    data_nasc,
    sexo,
    nivel_gravidade,
    foto_perfil,
    responsavel,
    alvo_atual
  ) {
    return await Paciente.findByIdAndUpdate(
      id,
      {
        nome,
        sobrenome,
        endereco,
        data_nasc,
        sexo,
        nivel_gravidade,
        foto_perfil,
        responsavel,
        alvo_atual
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );
  }

  async getOne(id) {
    return await Paciente.findById(id);
  }

  async getByLogin(id_login) {
    return await Paciente.findOne({ id_login });
  }

  async setPin(id, hash) {
    return await Paciente.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { pin_responsavel: { $exists: false } },
          { pin_responsavel: null }
        ]
      },
      {
        $set: {
          pin_responsavel: hash,
          pin_tentativas: 0,
          pin_bloqueado_ate: null
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );
  }

  async getComPin(id) {
    return await Paciente.findById(id).select("+pin_responsavel");
  }

  async registrarErroPin(id, tentativas, bloqueado_ate) {
    return await Paciente.findByIdAndUpdate(id, {
      pin_tentativas: tentativas,
      pin_bloqueado_ate: bloqueado_ate
    });
  }

  async zerarErrosPin(id) {
    return await Paciente.findByIdAndUpdate(id, {
      pin_tentativas: 0,
      pin_bloqueado_ate: null
    });
  }

  async addGanhos(id, xp, moedas) {
    return await Paciente.findByIdAndUpdate(
      id,
      {
        $inc: { xp, moedas }
      },
      {
        returnDocument: "after"
      }
    );
  }

  async comprar(id, id_item, preco) {
    return await Paciente.findOneAndUpdate(
      {
        _id: id,
        moedas: { $gte: preco },
        inventario: { $ne: id_item }
      },
      {
        $inc: { moedas: -preco },
        $addToSet: { inventario: id_item }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );
  }

  async setCampos(id, campos) {
    return await Paciente.findByIdAndUpdate(
      id,
      {
        $set: campos
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );
  }
}

export default new pacienteService();
