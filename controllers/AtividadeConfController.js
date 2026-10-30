import atividadeConfService from "../services/atividadeConfService.js";
import palavraService from "../services/palavraService.js";
import notificacaoService from "../services/notificacaoService.js";
import { idValido, pacienteDaFono } from "../utils/acesso.js";

const TITULO_PADRAO = { treino: "Treinamento de Fonema", missao: "Missão do dia" };

const createAtividadeConf = async (req, res) => {
    try {
        const { id_paciente, tipo, titulo, palavras } = req.body;

        if (!["treino", "missao"].includes(tipo)) {
            return res.status(400).json({error: 'tipo deve ser "treino" ou "missao".'});
        }
        if (!Array.isArray(palavras) || palavras.length < 1 || palavras.length > 20 || !palavras.every(idValido)) {
            return res.status(400).json({error: "Envie de 1 a 20 ids de palavras."});
        }
        if (titulo !== undefined && (typeof titulo !== "string" || titulo.length > 80)) {
            return res.status(400).json({error: "Título inválido (máximo de 80 caracteres)."});
        }

        const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
        if (acesso.error) return res.status(acesso.status).json({error: acesso.error});

        const ids = [...new Set(palavras)];
        const encontradas = await palavraService.getByIds(ids);
        if (encontradas.length !== ids.length) {
            return res.status(400).json({error: "Alguma das palavras não existe."});
        }

        const atividade = await atividadeConfService.Create(
            req.loggedUser.idFono, acesso.paciente._id, tipo, (titulo || "").trim() || TITULO_PADRAO[tipo], ids
        );

        await notificacaoService.Create(
            acesso.paciente._id,
            "atividade",
            tipo === "missao"
                ? "Sua fonoaudióloga enviou uma nova missão para você! Vamos conferir?"
                : "Sua fonoaudióloga enviou um novo treino para você! Vamos conferir?"
        );

        res.status(201).json({message: "Atividade atribuída com sucesso!", atividade});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao atribuir atividade."});
    }
};

const getAllAtividadeConf = async (req, res) => {
    try {
        const { id_paciente, pendentes } = req.query;

        if (id_paciente) {
            const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
            if (acesso.error) return res.status(acesso.status).json({error: acesso.error});
        }

        const atividades = await atividadeConfService.getAllDaFono(req.loggedUser.idFono, id_paciente, pendentes === "true");
        res.status(200).json({atividades});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar atividades."});
    }
};

const atividadeDaFono = async (req, res) => {
    if (!idValido(req.params.id)) {
        res.status(400).json({error: "ID inválido."});
        return null;
    }
    const atividade = await atividadeConfService.getOne(req.params.id);
    if (!atividade) {
        res.status(404).json({error: "Atividade não encontrada."});
        return null;
    }
    if (atividade.id_fono.toString() !== req.loggedUser.idFono) {
        res.status(403).json({error: "Você não tem permissão para acessar esta atividade."});
        return null;
    }
    return atividade;
};

const getOneAtividadeConf = async (req, res) => {
    try {
        const atividade = await atividadeDaFono(req, res);
        if (atividade) res.status(200).json({atividade});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar atividade."});
    }
};

const deleteAtividadeConf = async (req, res) => {
    try {
        const atividade = await atividadeDaFono(req, res);
        if (!atividade) return;
        if (atividade.concluida_em) {
            return res.status(409).json({error: "Atividades concluídas ficam no histórico e não podem ser excluídas."});
        }
        await atividadeConfService.delete(atividade._id);
        res.status(200).json({message: "Atividade removida com sucesso!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao remover atividade."});
    }
};

export default { createAtividadeConf, getAllAtividadeConf, getOneAtividadeConf, deleteAtividadeConf };
