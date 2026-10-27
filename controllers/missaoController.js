import missaoService from "../services/missaoService.js";
import palavraService from "../services/palavraService.js";
import notificacaoService from "../services/notificacaoService.js";
import { idValido, pacienteDaFono } from "../utils/acesso.js";

const TITULO_PADRAO = { treino: "Treinamento de Fonema", missao: "Missão do dia" };

// a fono atribui um treino/missão a um paciente dela
const createMissao = async (req, res) => {
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

        const missao = await missaoService.Create(
            req.loggedUser.idFono, acesso.paciente._id, tipo, (titulo || "").trim() || TITULO_PADRAO[tipo], ids
        );

        await notificacaoService.Create(
            acesso.paciente._id,
            "missao",
            tipo === "missao"
                ? "Sua fonoaudióloga enviou uma nova missão para você! Vamos conferir?"
                : "Sua fonoaudióloga enviou um novo treino para você! Vamos conferir?"
        );

        res.status(201).json({message: "Missão atribuída com sucesso!", missao});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao atribuir missão."});
    }
};

// ?id_paciente=...&pendentes=true
const getAllMissao = async (req, res) => {
    try {
        const { id_paciente, pendentes } = req.query;

        if (id_paciente) {
            const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
            if (acesso.error) return res.status(acesso.status).json({error: acesso.error});
        }

        const missoes = await missaoService.getAllDaFono(req.loggedUser.idFono, id_paciente, pendentes === "true");
        res.status(200).json({missoes});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar missões."});
    }
};

// carrega a missao e confere se é desta fono
const missaoDaFono = async (req, res) => {
    if (!idValido(req.params.id)) {
        res.status(400).json({error: "ID inválido."});
        return null;
    }
    const missao = await missaoService.getOne(req.params.id);
    if (!missao) {
        res.status(404).json({error: "Missão não encontrada."});
        return null;
    }
    if (missao.id_fono.toString() !== req.loggedUser.idFono) {
        res.status(403).json({error: "Você não tem permissão para acessar esta missão."});
        return null;
    }
    return missao;
};

const getOneMissao = async (req, res) => {
    try {
        const missao = await missaoDaFono(req, res);
        if (missao) res.status(200).json({missao});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar missão."});
    }
};

const deleteMissao = async (req, res) => {
    try {
        const missao = await missaoDaFono(req, res);
        if (!missao) return;
        if (missao.concluida_em) {
            return res.status(409).json({error: "Missões concluídas ficam no histórico e não podem ser excluídas."});
        }
        await missaoService.delete(missao._id);
        res.status(200).json({message: "Missão removida com sucesso!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao remover missão."});
    }
};

export default { createMissao, getAllMissao, getOneMissao, deleteMissao };
