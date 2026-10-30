import atividadeService from "../services/atividadeService.js";
import pacienteService from "../services/pacienteService.js";

import {ObjectId} from "mongodb";

const pacienteDaFono = async (id_paciente, idFono) => {
    if (!ObjectId.isValid(id_paciente)) return {status: 400, error: "ID do paciente inválido."};
    const paciente = await pacienteService.getOne(id_paciente);
    if (!paciente || !paciente.ativo) return {status: 404, error: "Paciente não encontrado."};
    if (paciente.id_fono.toString() !== idFono) return {status: 403, error: "Você não tem permissão para este paciente."};
    return {paciente};
};

const podeVer = (atividade, { tipo, idFono, idPaciente }) =>
    tipo === "Fono" ? atividade.id_fono.toString() === idFono : atividade.id_paciente.toString() === idPaciente;

const getAllAtividade = async (req, res) => {
    try {
        const { tipo, idFono, idPaciente } = req.loggedUser;
        let atividades;
        if (tipo === "Fono") {
            const { id_paciente } = req.query;
            const filtro = { id_fono: idFono };
            if (id_paciente) {
                const acesso = await pacienteDaFono(id_paciente, idFono);
                if (acesso.error) return res.status(acesso.status).json({error: acesso.error});
                filtro.id_paciente = id_paciente;
            }
            atividades = await atividadeService.getAll(filtro);
        } else {
            atividades = await atividadeService.getAll({ id_paciente: idPaciente });
        }
        res.status(200).json({atividades});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar atividades."});
    }
};

const getOneAtividade = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const atividade = await atividadeService.getOne(id);
            if (!atividade) {
                return res.status(404).json({error: "Atividade não encontrada."});
            }
            if (!podeVer(atividade, req.loggedUser)) {
                return res.status(403).json({error: "Você não tem permissão para ver esta atividade."});
            }
            res.status(200).json({atividade});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar atividade."});
    }
};

const createAtividade = async (req, res) => {
    try {
        const { id_paciente, fonema, posicao, frequencia, tempo_pratica } = req.body;
        if (!id_paciente || !fonema || !posicao) {
            return res.status(400).json({error: "Preencha paciente, fonema e posição."});
        }

        const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
        if (acesso.error) return res.status(acesso.status).json({error: acesso.error});

        const atividade = await atividadeService.Create(id_paciente, req.loggedUser.idFono, fonema, posicao, frequencia, tempo_pratica);
        res.status(201).json({message: "Atividade criada com sucesso!", atividade});
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao criar atividade."});
    }
};

const updateAtividade = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const atividade = await atividadeService.getOne(id);
            if (!atividade) {
                return res.status(404).json({error: "Atividade não encontrada."});
            }
            if (atividade.id_fono.toString() !== req.loggedUser.idFono) {
                return res.status(403).json({error: "Você não tem permissão para atualizar esta atividade."});
            }
            const { fonema, posicao, frequencia, tempo_pratica } = req.body;
            const atualizada = await atividadeService.update(id, fonema, posicao, frequencia, tempo_pratica);
            res.status(200).json({message: "Atividade atualizada com sucesso!", atividade: atualizada});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({error: "Dados inválidos. Confira os campos."});
        }
        res.status(500).json({error: "Erro ao atualizar atividade."});
    }
};

const deleteAtividade = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const atividade = await atividadeService.getOne(id);
            if (!atividade) {
                return res.status(404).json({error: "Atividade não encontrada."});
            }
            if (atividade.id_fono.toString() !== req.loggedUser.idFono) {
                return res.status(403).json({error: "Você não tem permissão para deletar esta atividade."});
            }
            await atividadeService.delete(id);
            res.status(200).json({message: "Atividade deletada com sucesso!"});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao deletar atividade."});
    }
};

export default { getAllAtividade, getOneAtividade, createAtividade, updateAtividade, deleteAtividade };