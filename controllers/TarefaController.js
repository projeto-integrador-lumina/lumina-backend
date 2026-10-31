import tarefaService from "../services/tarefaService.js";
import { idValido, pacienteDaFono } from "../utils/acesso.js";

const getAllTarefa = async (req, res) => {
    try {
        const { id_paciente, pendentes } = req.query;

        if (id_paciente) {
            const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
            if (acesso.error) return res.status(acesso.status).json({error: acesso.error});
        }

        const tarefas = await tarefaService.getAllDaFono(req.loggedUser.idFono, id_paciente, pendentes === "true");
        res.status(200).json({tarefas});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar tarefas."});
    }
};

const tarefaDaFono = async (req, res) => {
    if (!idValido(req.params.id)) {
        res.status(400).json({error: "ID inválido."});
        return null;
    }
    const tarefa = await tarefaService.getOne(req.params.id);
    if (!tarefa) {
        res.status(404).json({error: "Tarefa não encontrada."});
        return null;
    }
    if (tarefa.id_fono.toString() !== req.loggedUser.idFono) {
        res.status(403).json({error: "Você não tem permissão para acessar esta tarefa."});
        return null;
    }
    return tarefa;
};

const getOneTarefa = async (req, res) => {
    try {
        const tarefa = await tarefaDaFono(req, res);
        if (tarefa) res.status(200).json({tarefa});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar tarefa."});
    }
};

const deleteTarefa = async (req, res) => {
    try {
        const tarefa = await tarefaDaFono(req, res);
        if (!tarefa) return;
        if (tarefa.concluida_em) {
            return res.status(409).json({error: "Tarefas concluídas ficam no histórico e não podem ser excluídas."});
        }
        await tarefaService.delete(tarefa._id);
        res.status(200).json({message: "Tarefa removida com sucesso!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao remover tarefa."});
    }
};

export default { getAllTarefa, getOneTarefa, deleteTarefa };