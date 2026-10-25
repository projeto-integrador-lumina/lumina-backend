import mensagemService from "../services/mensagemService.js";
import pacienteService from "../services/pacienteService.js";

import {ObjectId} from "mongodb";

// a fono participa das conversas dela; o paciente (PWA, o responsável) das conversas do paciente
const participa = (conversa, { tipo, idFono, idPaciente }) =>
    tipo === "Fono" ? conversa.id_fono.toString() === idFono : conversa.id_paciente.toString() === idPaciente;

// o remetente vem do token, nunca do corpo da requisição
const remetenteDe = (tipo) => (tipo === "Fono" ? "Fono" : "Responsavel");

const getAllConversa = async (req, res) => {
    try {
        const { tipo, idFono, idPaciente } = req.loggedUser;
        const filtro = tipo === "Fono" ? { id_fono: idFono } : { id_paciente: idPaciente };
        const conversas = await mensagemService.getConversas(filtro);
        res.status(200).json({conversas});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar conversas."});
    }
};

// Fono: envia { id_paciente }. Paciente: não envia nada (usa o próprio id e a fono dele).
const createConversa = async (req, res) => {
    try {
        const { tipo, idFono, idPaciente } = req.loggedUser;
        const id_paciente = tipo === "Fono" ? req.body.id_paciente : idPaciente;

        if (!id_paciente) {
            return res.status(400).json({error: "Informe o id_paciente."});
        }
        if (!ObjectId.isValid(id_paciente)) {
            return res.status(400).json({error: "ID do paciente inválido."});
        }

        const paciente = await pacienteService.getOne(id_paciente);
        if (!paciente || !paciente.ativo) {
            return res.status(404).json({error: "Paciente não encontrado."});
        }
        if (tipo === "Fono" && paciente.id_fono.toString() !== idFono) {
            return res.status(403).json({error: "Você não tem permissão para este paciente."});
        }

        const id_fono = paciente.id_fono;
        const existente = await mensagemService.getConversaDaDupla(id_fono, id_paciente);
        if (existente) {
            return res.status(200).json({conversa: existente});
        }
        const conversa = await mensagemService.CreateConversa(id_fono, id_paciente);
        res.status(201).json({message: "Conversa criada com sucesso!", conversa});
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).json({error: "Essa conversa já existe."});
        }
        res.status(500).json({error: "Erro ao criar conversa."});
    }
};

const getMensagens = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const conversa = await mensagemService.getConversa(id);
            if (!conversa) {
                return res.status(404).json({error: "Conversa não encontrada."});
            }
            if (!participa(conversa, req.loggedUser)) {
                return res.status(403).json({error: "Você não tem permissão para ver esta conversa."});
            }
            const mensagens = await mensagemService.getMensagens(id);
            res.status(200).json({mensagens});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar mensagens."});
    }
};

const createMensagem = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const conteudo = String(req.body.conteudo || "").trim();
            if (!conteudo) {
                return res.status(400).json({error: "A mensagem não pode estar vazia."});
            }
            const conversa = await mensagemService.getConversa(id);
            if (!conversa) {
                return res.status(404).json({error: "Conversa não encontrada."});
            }
            if (!participa(conversa, req.loggedUser)) {
                return res.status(403).json({error: "Você não tem permissão para esta conversa."});
            }
            const mensagem = await mensagemService.CreateMensagem(id, remetenteDe(req.loggedUser.tipo), conteudo);
            res.status(201).json({message: "Mensagem enviada com sucesso!", mensagem});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao enviar mensagem."});
    }
};

// só quem RECEBEU a mensagem pode marcá-la como lida
const marcarLida = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const mensagem = await mensagemService.getMensagem(id);
            if (!mensagem) {
                return res.status(404).json({error: "Mensagem não encontrada."});
            }
            const conversa = await mensagemService.getConversa(mensagem.id_conversa);
            if (!conversa || !participa(conversa, req.loggedUser)) {
                return res.status(403).json({error: "Você não tem permissão para esta mensagem."});
            }
            if (mensagem.remetente === remetenteDe(req.loggedUser.tipo)) {
                return res.status(400).json({error: "Você não pode marcar a própria mensagem como lida."});
            }
            const atualizada = await mensagemService.marcarLida(id);
            res.status(200).json({mensagem: atualizada});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao marcar mensagem como lida."});
    }
};

// só quem ENVIOU a mensagem pode apagá-la
const deleteMensagem = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const mensagem = await mensagemService.getMensagem(id);
            if (!mensagem) {
                return res.status(404).json({error: "Mensagem não encontrada."});
            }
            const conversa = await mensagemService.getConversa(mensagem.id_conversa);
            if (!conversa || !participa(conversa, req.loggedUser)) {
                return res.status(403).json({error: "Você não tem permissão para esta mensagem."});
            }
            if (mensagem.remetente !== remetenteDe(req.loggedUser.tipo)) {
                return res.status(403).json({error: "Você só pode apagar as suas próprias mensagens."});
            }
            await mensagemService.deleteMensagem(id);
            res.status(200).json({message: "Mensagem deletada com sucesso!"});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao deletar mensagem."});
    }
};

export default { getAllConversa, createConversa, getMensagens, createMensagem, marcarLida, deleteMensagem };