import pacienteService from "../services/pacienteService.js";
import usuarioService from "../services/usuarioService.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

import {ObjectId} from "mongodb";

const gerarUsernameUnico = async (nome) => {
    const base = String(nome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase() || "paciente";

    for (let i = 0; i < 10; i++) {
        const candidato = base + Math.floor(1000 + Math.random() * 9000);
        if (!(await usuarioService.getOne(candidato))) return candidato;
    }
    throw new Error("Não foi possível gerar um nome de usuário único.");
};

const gerarSenhaProvisoria = () => crypto.randomBytes(4).toString("hex");

const getAllPaciente = async (req, res) => {
    try {
        const pacientes = await pacienteService.getAll(req.loggedUser.idFono);
        res.status(200).json({pacientes});
    } catch (error) {
        console.log (error);
        res.status(500).json({error: "Erro ao buscar Paciente."});
    }
};

const createPaciente = async (req, res) => {
    let login = null;
    try {
        const { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel} = req.body;

        if (!nome || !sobrenome || !data_nasc || !responsavel || !responsavel.nome) {
            return res.status(400).json({error: "Preencha nome, sobrenome, data de nascimento e responsável."});
        }

        const username = await gerarUsernameUnico(nome);
        const senhaProvisoria = gerarSenhaProvisoria();
        const hash = bcrypt.hashSync(senhaProvisoria, 10);
        login = await usuarioService.Create(username, hash, "Paciente", true);

        const paciente = await pacienteService.Create(nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, req.loggedUser.idFono, login._id);

        res.status(201).json({
            message: "Paciente cadastrado com sucesso!",
            paciente,
            login: { usuario: username, senha: senhaProvisoria }
        });
    } catch (error) {
        if (login) await usuarioService.delete(login._id);

        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao cadastrar paciente."});
    };
};

const deletePaciente = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const paciente = await pacienteService.getOne(id);
            if (!paciente || !paciente.ativo) {
                return res.status(404).json({error: "Paciente não encontrado."});
            }
            if (paciente.id_fono.toString() !== req.loggedUser.idFono) {
                return res.status(403).json({error: "Você não tem permissão para deletar este paciente."});
            }
            await pacienteService.delete(id);
            res.status(200).json({message: "Paciente deletado com sucesso!"});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao deletar paciente."});
    };
};

const updatePaciente = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const paciente = await pacienteService.getOne(id);
            if (!paciente || !paciente.ativo) {
                return res.status(404).json({error: "Paciente não encontrado."});
            }
            if (paciente.id_fono.toString() !== req.loggedUser.idFono) {
                return res.status(403).json({error: "Você não tem permissão para atualizar este Paciente."});
            }
            const { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel } = req.body;
            await pacienteService.update(id, nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel);
            res.status(200).json({message: "Paciente atualizado com sucesso!"});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao atualizar paciente."});
    }
};

const getOnePaciente = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const paciente = await pacienteService.getOne(id);
            if (!paciente || !paciente.ativo) {
                return res.status(404).json({error: "Paciente não encontrado."});
            }
            if (paciente.id_fono.toString() !== req.loggedUser.idFono) {
                return res.status(403).json({error: "Você não tem permissão para ver este Paciente."});
            }
            const login = await usuarioService.getById(paciente.id_login);
            res.status(200).json({
                paciente,
                login: login ? { usuario: login.usuario, precisa_trocar_senha: login.precisa_trocar_senha } : null
            });
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar Paciente."});
    }
};

const resetarSenhaPaciente = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const paciente = await pacienteService.getOne(id);
            if (!paciente || !paciente.ativo) {
                return res.status(404).json({error: "Paciente não encontrado."});
            }
            if (paciente.id_fono.toString() !== req.loggedUser.idFono) {
                return res.status(403).json({error: "Você não tem permissão para alterar este Paciente."});
            }
            const login = await usuarioService.getById(paciente.id_login);
            const senhaProvisoria = gerarSenhaProvisoria();
            const hash = bcrypt.hashSync(senhaProvisoria, 10);
            await usuarioService.updateSenha(login._id, hash, true);

            res.status(200).json({
                message: "Senha redefinida com sucesso!",
                login: { usuario: login.usuario, senha: senhaProvisoria }
            });
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao redefinir senha."});
    }
};

export default { getAllPaciente, createPaciente, deletePaciente, updatePaciente, getOnePaciente, resetarSenhaPaciente };