import pacienteService from "../services/pacienteService.js";
import usuarioService from "../services/usuarioService.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

import {ObjectId} from "mongodb";

// "Maria Souza" -> "mariasouza4821" (tenta até achar um que não exista)
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

const PIN_VALIDO = /^\d{4,6}$/;

// 8 caracteres, ex: "a3f91c0e"
const gerarSenhaProvisoria = () => crypto.randomBytes(4).toString("hex");

// carrega o paciente e confere se é DESTA fono. Se não puder seguir, já responde e devolve null.
// exigirAtivo: bloqueia alterações em paciente desativado (409)
const carregar = async (req, res, { exigirAtivo = false } = {}) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).json({error: "ID inválido."});
        return null;
    }
    const paciente = await pacienteService.getOne(id);
    if (!paciente) {
        res.status(404).json({error: "Paciente não encontrado."});
        return null;
    }
    if (paciente.id_fono.toString() !== req.loggedUser.idFono) {
        res.status(403).json({error: "Você não tem permissão para acessar este paciente."});
        return null;
    }
    if (exigirAtivo && !paciente.ativo) {
        res.status(409).json({error: "Paciente desativado. Ative-o para continuar."});
        return null;
    }
    return paciente;
};

// ?ativo=true (padrão) | false | todos
const getAllPaciente = async (req, res) => {
    try {
        const { ativo } = req.query;
        if (ativo !== undefined && !["true", "false", "todos"].includes(ativo)) {
            return res.status(400).json({error: 'ativo deve ser "true", "false" ou "todos".'});
        }
        const filtro = ativo === "false" ? false : ativo === "todos" ? null : true;
        const pacientes = await pacienteService.getAll(req.loggedUser.idFono, filtro);
        res.status(200).json({pacientes});
    } catch (error) {
        console.log (error);
        res.status(500).json({error: "Erro ao buscar Paciente."});
    }
};


const createPaciente = async (req, res) => {
    let login = null;
    try {
        // "ativo" não vem do cliente: o paciente nasce ativo
        const { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, alvo_atual, pin_responsavel} = req.body;

        if (pin_responsavel !== undefined && !PIN_VALIDO.test(String(pin_responsavel))) {
            return res.status(400).json({error: "O PIN do responsável deve ter de 4 a 6 números."});
        }
        if (!nome || !sobrenome || !data_nasc || !responsavel || !responsavel.nome) {
            return res.status(400).json({error: "Preencha nome, sobrenome, data de nascimento e responsável."});
        }

        // 1) cria o login do paciente (senha provisória aleatória)
        const username = await gerarUsernameUnico(nome);
        const senhaProvisoria = gerarSenhaProvisoria();
        const hash = bcrypt.hashSync(senhaProvisoria, 10);
        login = await usuarioService.Create(username, hash, "Paciente", true);

        // 2) cria o paciente ligado à fono logada e ao login
        const paciente = await pacienteService.Create(nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, req.loggedUser.idFono, login._id, alvo_atual);

        // PIN (opcional) que libera as mensagens no PWA
        if (pin_responsavel !== undefined) {
            await pacienteService.setPin(paciente._id, bcrypt.hashSync(String(pin_responsavel), 10));
        }

        // a senha só existe em texto aqui: a fono repassa ao paciente/responsável
        res.status(201).json({
            message: "Paciente cadastrado com sucesso!",
            paciente,
            login: { usuario: username, senha: senhaProvisoria }
        });
    } catch (error) {
        // desfaz o login se o paciente não foi criado
        if (login) await usuarioService.delete(login._id);

        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao cadastrar paciente."});
    };
};

// ativa ou desativa o paciente e o login dele
const alterarAtivo = (ativar) => async (req, res) => {
    try {
        const paciente = await carregar(req, res);
        if (!paciente) return;
        if (paciente.ativo === ativar) {
            return res.status(409).json({error: ativar ? "Paciente já está ativo." : "Paciente já está desativado."});
        }
        await pacienteService.setAtivo(paciente._id, ativar);
        res.status(200).json({message: ativar ? "Paciente ativado com sucesso!" : "Paciente desativado com sucesso!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: ativar ? "Erro ao ativar paciente." : "Erro ao desativar paciente."});
    }
};
const ativarPaciente = alterarAtivo(true);
const desativarPaciente = alterarAtivo(false);
const deletePaciente = desativarPaciente; // DELETE = desativar (o histórico fica)

const updatePaciente = async (req, res) => {
    try {
        const paciente = await carregar(req, res, { exigirAtivo: true });
        if (!paciente) return;
        const { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, alvo_atual } = req.body;
        await pacienteService.update(paciente._id, nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, responsavel, alvo_atual);
        res.status(200).json({message: "Paciente atualizado com sucesso!"});
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao atualizar paciente."});
    }
};

// também mostra paciente desativado (para a fono poder reativar)
const getOnePaciente = async (req, res) => {
    try {
        const paciente = await carregar(req, res);
        if (!paciente) return;
        const login = await usuarioService.getById(paciente.id_login);
        res.status(200).json({
            paciente,
            login: login ? { usuario: login.usuario, precisa_trocar_senha: login.precisa_trocar_senha } : null
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar Paciente."});
    }
};

// gera uma nova senha provisória (ex.: paciente esqueceu a senha)
const resetarSenhaPaciente = async (req, res) => {
    try {
        const paciente = await carregar(req, res, { exigirAtivo: true });
        if (!paciente) return;
        const login = await usuarioService.getById(paciente.id_login);
        const senhaProvisoria = gerarSenhaProvisoria();
        const hash = bcrypt.hashSync(senhaProvisoria, 10);
        await usuarioService.updateSenha(login._id, hash, true);

        res.status(200).json({
            message: "Senha redefinida com sucesso!",
            login: { usuario: login.usuario, senha: senhaProvisoria }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao redefinir senha."});
    }
};

// define/troca o PIN do responsável (4 a 6 números)
const definirPinPaciente = async (req, res) => {
    try {
        if (!PIN_VALIDO.test(String(req.body.pin || ""))) {
            return res.status(400).json({error: "O PIN deve ter de 4 a 6 números."});
        }
        const paciente = await carregar(req, res, { exigirAtivo: true });
        if (!paciente) return;

        await pacienteService.setPin(paciente._id, bcrypt.hashSync(String(req.body.pin), 10));
        res.status(200).json({message: "PIN do responsável atualizado!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao definir PIN."});
    }
};

export default { getAllPaciente, createPaciente, deletePaciente, ativarPaciente, desativarPaciente, updatePaciente, getOnePaciente, resetarSenhaPaciente, definirPinPaciente };
