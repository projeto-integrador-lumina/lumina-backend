
import NotaClinica from "../models/NotaClinica.js";
import { pacienteDaFono, idValido } from "../utils/acesso.js";

async function acesso(req, res) {
    const r = await pacienteDaFono(
        req.params.id,
        req.loggedUser.idFono
    );

    if (r.error) {
        res.status(r.status).json({ error: r.error });
        return false;
    }

    return true;
}

const listar = async (req, res) => {
    try {
        if (!await acesso(req, res)) return;

        const notas = await NotaClinica.find({
            id_paciente: req.params.id,
            id_fono: req.loggedUser.idFono
        }).sort({ createdAt: -1 });

        return res.json({ notas });

    } catch (e) {
        return res.status(500).json({
            error: "Erro ao consultar notas."
        });
    }
};

const criar = async (req, res) => {
    try {
        if (!await acesso(req, res)) return;

        const texto = req.body.texto;

        if (
            typeof texto !== "string" ||
            !texto.trim() ||
            texto.length > 3000
        ) {
            return res.status(400).json({
                error: "Texto inválido."
            });
        }

        const nota = await NotaClinica.create({
            id_paciente: req.params.id,
            id_fono: req.loggedUser.idFono,
            texto: texto.trim()
        });

        return res.status(201).json({ nota });

    } catch (e) {
        return res.status(500).json({
            error: "Erro ao criar nota."
        });
    }
};

const alterar = async (req, res) => {
    try {
        if (!await acesso(req, res)) return;

        if (!idValido(req.params.notaId)) {
            return res.status(400).json({
                error: "ID inválido."
            });
        }

        const texto = req.body.texto;

        if (
            typeof texto !== "string" ||
            !texto.trim() ||
            texto.length > 3000
        ) {
            return res.status(400).json({
                error: "Texto inválido."
            });
        }

        const nota = await NotaClinica.findOneAndUpdate(
            {_id: req.params.notaId, id_paciente: req.params.id, id_fono: req.loggedUser.idFono},
            {texto: texto.trim()},
            {
                new: true,
                runValidators: true
            }
        );

        if (!nota) {
            return res.status(404).json({
                error: "Nota não encontrada."
            });
        }

        return res.json({ nota });

    } catch (e) {
        return res.status(500).json({
            error: "Erro ao alterar nota."
        });
    }
};

const remover = async (req, res) => {
    try {
        if (!await acesso(req, res)) return;

        if (!idValido(req.params.notaId)) {
            return res.status(400).json({
                error: "ID inválido."
            });
        }

        const nota = await NotaClinica.findOneAndDelete({
            _id: req.params.notaId,
            id_paciente: req.params.id,
            id_fono: req.loggedUser.idFono
        });

        if (!nota) {
            return res.status(404).json({
                error: "Nota não encontrada."
            });
        }

        return res.json({
            message: "Nota removida."
        });

    } catch (e) {
        return res.status(500).json({
            error: "Erro ao remover nota."
        });
    }
};

export default {listar, criar,alterar,remover};
