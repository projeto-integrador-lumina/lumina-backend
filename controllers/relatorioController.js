import relatorioService from "../services/relatorioService.js";
import { pacienteDaFono } from "../utils/acesso.js";
import { lerPeriodo } from "../utils/data.js";

const preparar = async (req, res, { pacienteObrigatorio = false } = {}) => {
    const periodo = lerPeriodo(req.query);
    if (periodo.erro) {
        res.status(400).json({error: periodo.erro});
        return null;
    }

    const { id_paciente } = req.query;
    if (pacienteObrigatorio && !id_paciente) {
        res.status(400).json({error: "id_paciente é obrigatório."});
        return null;
    }

    const todos = await relatorioService.pacientesDaFono(req.loggedUser.idFono);

    if (id_paciente) {
        const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
        if (acesso.error) {
            res.status(acesso.status).json({error: acesso.error});
            return null;
        }
        return { periodo, pacientes: todos.filter((p) => String(p._id) === String(acesso.paciente._id)) };
    }
    return { periodo, pacientes: todos };
};

const getResumo = async (req, res) => {
    try {
        const ctx = await preparar(req, res);
        if (!ctx) return;
        res.status(200).json(await relatorioService.resumo(ctx.pacientes, ctx.periodo));
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao gerar resumo."});
    }
};

const getFonema = async (req, res) => {
    try {
        const ctx = await preparar(req, res);
        if (!ctx) return;
        const fonemas = await relatorioService.porFonema(ctx.pacientes.map((p) => p._id), ctx.periodo);
        res.status(200).json({periodo: {de: ctx.periodo.de, ate: ctx.periodo.ate}, fonemas});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao gerar relatório por fonema."});
    }
};

const getAtividade = async (req, res) => {
    try {
        const ctx = await preparar(req, res);
        if (!ctx) return;
        const atividade = await relatorioService.porAtividade(ctx.pacientes, ctx.periodo);
        res.status(200).json({periodo: {de: ctx.periodo.de, ate: ctx.periodo.ate}, ...atividade});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao gerar relatório de atividade."});
    }
};

const getEvolucao = async (req, res) => {
    try {
        const ctx = await preparar(req, res, { pacienteObrigatorio: true });
        if (!ctx) return;
        res.status(200).json(await relatorioService.evolucao(req.query.id_paciente, ctx.periodo));
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao gerar evolução."});
    }
};

export default { getResumo, getFonema, getAtividade, getEvolucao };