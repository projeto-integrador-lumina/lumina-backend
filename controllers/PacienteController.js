import pacienteService from "../services/pacienteService.js";
import usuarioService from "../services/usuarioService.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";

import { ObjectId } from "mongodb";
import { idade } from "../utils/data.js";

const comIdade = (p) => ({
  ...p.toJSON(),
  idade: idade(p.data_nasc),
});

const gerarUsernameUnico = async (nome) => {
  const base =
    String(nome || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "")
      .toLowerCase() || "paciente";

  for (let i = 0; i < 10; i++) {
    const numero = crypto.randomInt(1000, 10000);
    const candidato = base + numero;

    if (!(await usuarioService.getOne(candidato))) {
      return candidato;
    }
  }

  throw new Error("Não foi possível gerar um nome de usuário único.");
};

const PIN_VALIDO = /^\d{4,6}$/;

const removerArquivo = (req) => {
  if (req.file?.path) {
    fs.unlink(req.file.path, () => {});
  }
};

const gerarSenhaInicial = () => {
  return crypto.randomBytes(4).toString("hex");
};

const carregar = async (req, res, { exigirAtivo = false } = {}) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    res.status(400).json({
      error: "ID inválido.",
    });
    return null;
  }

  const paciente = await pacienteService.getOne(id);

  if (!paciente) {
    res.status(404).json({
      error: "Paciente não encontrado.",
    });
    return null;
  }

  if (String(paciente.id_fono) !== String(req.loggedUser.idFono)) {
    res.status(403).json({
      error: "Você não tem permissão para acessar este paciente.",
    });
    return null;
  }

  if (exigirAtivo && !paciente.ativo) {
    res.status(409).json({
      error: "Paciente desativado. Ative-o para continuar.",
    });
    return null;
  }

  return paciente;
};

const getAllPaciente = async (req, res) => {
  try {
    const { ativo } = req.query;

    if (ativo !== undefined && !["true", "false", "todos"].includes(ativo)) {
      return res.status(400).json({
        error: 'ativo deve ser "true", "false" ou "todos".',
      });
    }

    const filtro = ativo === "false" ? false : ativo === "todos" ? null : true;

    const pacientes = await pacienteService.getAll(
      req.loggedUser.idFono,
      filtro,
    );

    return res.status(200).json({
      pacientes: pacientes.map(comIdade),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Erro ao buscar pacientes.",
    });
  }
};

const createPaciente = async (req, res) => {
  let login = null;
  let pacienteCriado = null;

  try {
    const {
      nome,
      sobrenome,
      endereco,
      data_nasc,
      sexo,
      nivel_gravidade,
      responsavel,
      pin_responsavel,
    } = req.body;

    const foto_perfil = req.file ? `/uploads/${req.file.filename}` : null;

    if (
      pin_responsavel !== undefined &&
      !PIN_VALIDO.test(String(pin_responsavel))
    ) {
      removerArquivo(req);

      return res.status(400).json({
        error: "O PIN do responsável deve ter de 4 a 6 números.",
      });
    }

    if (
      !nome ||
      !sobrenome ||
      !data_nasc ||
      !responsavel ||
      !responsavel.nome
    ) {
      removerArquivo(req);

      return res.status(400).json({
        error: "Preencha nome, sobrenome, data de nascimento e responsável.",
      });
    }

    const username = await gerarUsernameUnico(nome);
    const senhaInicial = gerarSenhaInicial();
    const hashSenha = await bcrypt.hash(senhaInicial, 10);

    login = await usuarioService.Create(username, hashSenha, "Paciente", false);

    pacienteCriado = await pacienteService.Create(
      nome,
      sobrenome,
      endereco,
      data_nasc,
      sexo,
      nivel_gravidade,
      foto_perfil,
      responsavel,
      req.loggedUser.idFono,
      login._id,
    );

    if (pin_responsavel !== undefined) {
      const hashPin = await bcrypt.hash(String(pin_responsavel), 10);

      await pacienteService.setPin(pacienteCriado._id, hashPin);
    }

    return res.status(201).json({
      message: "Paciente cadastrado com sucesso!",
      paciente: pacienteCriado,
      login: {
        usuario: username,
        senha: senhaInicial,
      },
    });
  } catch (error) {
    console.log(error);

    removerArquivo(req);

    if (pacienteCriado?._id) {
      try {
        await pacienteService.delete(pacienteCriado._id);
      } catch (erroLimpeza) {
        console.error(
          "Erro ao remover paciente após falha no cadastro:",
          erroLimpeza,
        );
      }
    }

    if (login?._id) {
      try {
        await usuarioService.delete(login._id);
      } catch (erroLimpeza) {
        console.error(
          "Erro ao remover login após falha no cadastro:",
          erroLimpeza,
        );
      }
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Dados inválidos. Confira os campos.",
      });
    }

    return res.status(500).json({
      error: "Erro ao cadastrar paciente.",
    });
  }
};

const alterarAtivo = (ativar) => async (req, res) => {
  try {
    const paciente = await carregar(req, res);

    if (!paciente) return;

    if (paciente.ativo === ativar) {
      return res.status(409).json({
        error: ativar
          ? "Paciente já está ativo."
          : "Paciente já está desativado.",
      });
    }

    await pacienteService.setAtivo(paciente._id, ativar);

    return res.status(200).json({
      message: ativar
        ? "Paciente ativado com sucesso!"
        : "Paciente desativado com sucesso!",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: ativar
        ? "Erro ao ativar paciente."
        : "Erro ao desativar paciente.",
    });
  }
};

const ativarPaciente = alterarAtivo(true);
const desativarPaciente = alterarAtivo(false);
const deletePaciente = desativarPaciente;

const updatePaciente = async (req, res) => {
  try {
    const paciente = await carregar(req, res, {
      exigirAtivo: true,
    });

    if (!paciente) {
      removerArquivo(req);
      return;
    }

    const {
      nome,
      sobrenome,
      endereco,
      data_nasc,
      sexo,
      nivel_gravidade,
      responsavel,
    } = req.body;

    const foto_perfil = req.file ? `/uploads/${req.file.filename}` : undefined;

    await pacienteService.update(
      paciente._id,
      nome,
      sobrenome,
      endereco,
      data_nasc,
      sexo,
      nivel_gravidade,
      foto_perfil,
      responsavel,
    );

    if (req.file && paciente.foto_perfil) {
      fs.unlink(paciente.foto_perfil.replace(/^\//, ""), () => {});
    }

    return res.status(200).json({
      message: "Paciente atualizado com sucesso!",
    });
  } catch (error) {
    removerArquivo(req);
    console.log(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Dados inválidos. Confira os campos.",
      });
    }

    return res.status(500).json({
      error: "Erro ao atualizar paciente.",
    });
  }
};

const getOnePaciente = async (req, res) => {
  try {
    const paciente = await carregar(req, res);

    if (!paciente) return;

    const login = await usuarioService.getById(paciente.id_login);

    const pacienteComPin = await pacienteService.getComPin(paciente._id);

    const possuiPin = Boolean(pacienteComPin?.pin_responsavel);

    return res.status(200).json({
      paciente: {
        ...comIdade(paciente),
        possui_pin_responsavel: possuiPin,
      },
      login: login
        ? {
            usuario: login.usuario,
            precisa_trocar_senha: login.precisa_trocar_senha,
          }
        : null,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Erro ao buscar paciente.",
    });
  }
};

const definirPinPaciente = async (req, res) => {
  try {
    const pin = String(req.body?.pin || "");

    if (!PIN_VALIDO.test(pin)) {
      return res.status(400).json({
        error: "O PIN deve ter de 4 a 6 números.",
      });
    }

    const paciente = await carregar(req, res, {
      exigirAtivo: true,
    });

    if (!paciente) return;

    const pacienteComPin = await pacienteService.getComPin(paciente._id);

    if (pacienteComPin?.pin_responsavel) {
      return res.status(409).json({
        error: "Este paciente já possui um PIN. Não é permitido gerar outro.",
      });
    }

    const hashPin = await bcrypt.hash(pin, 10);

    const resultado = await pacienteService.setPin(paciente._id, hashPin);

    if (!resultado) {
      return res.status(409).json({
        error: "Este paciente já possui um PIN. Não é permitido gerar outro.",
      });
    }

    return res.status(200).json({
      message: "PIN do responsável criado com sucesso!",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Erro ao definir PIN.",
    });
  }
};

const getMeuPerfil = async (req, res) => {
  try {
    if (req.loggedUser.tipo !== "Paciente" || !req.loggedUser.idPaciente) {
      return res.status(403).json({
        error: "Acesso permitido apenas para pacientes.",
      });
    }

    const paciente = await pacienteService.getOne(req.loggedUser.idPaciente);

    if (!paciente || !paciente.ativo) {
      return res.status(404).json({
        error: "Paciente não encontrado.",
      });
    }

    return res.status(200).json({
      paciente: {
        nome: paciente.nome,
        sobrenome: paciente.sobrenome,
        data_nasc: paciente.data_nasc,
        idade: idade(paciente.data_nasc),
        foto_perfil: paciente.foto_perfil,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Erro ao buscar perfil do paciente.",
    });
  }
};

export default {
  getAllPaciente,
  createPaciente,
  deletePaciente,
  ativarPaciente,
  desativarPaciente,
  updatePaciente,
  getOnePaciente,
  getMeuPerfil,
  definirPinPaciente,
};
