import foodService from "../services/foodService.js";

import {ObjectId} from "mongodb";

const getAllPaciente = async (req, res) => {
    try {
        const pacientes = await pacienteService.getAll();
        res.status(200).json({paciente: pacientes});
    } catch (error) {
        console.log (error);
        res.status(500).json({error: "Erro ao buscar Paciente."});
    }
};


const createPaciente = async (req, res) => {
    try {
        const { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel} = req.body;
        await foodService.Create(nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel, req.loggedUser.id);
        res.status(201).json({message: "Paciente cadastrado com sucesso!"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao cadastrar paciente."});
    };
};

const deletePaciente = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const paciente = await pacienteService.getOne(id);
            if (!paciente) {
                return res.status(404).json({error: "Paciente não encontrado."});
            }
            if (paciente.pacienteId.toString() !== req.loggedUser.id) {
                return res.status(403).json({error: "Você não tem permissão para deletar este alimento."});
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
            const food = await pacienteService.getOne(id);
            if (!food) {
                return res.status(404).json({error: "Paciente não encontrado."});
            }
            if (food.pacienteId.toString() !== req.loggedUser.id) {
                return res.status(403).json({error: "Você não tem permissão para deletar este alimento."});
            }
            const { nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel } = req.body;
            await pacienteService.update(id, nome, sobrenome, endereco, data_nasc, sexo, nivel_gravidade, foto_perfil, ativo, responsavel);
            res.status(200).json({message: "Paciente atualizado com sucesso!"});
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao atualizar paciente."});
    }
};

const getOnePaciente = async (req, res) => {
    try {
        const id = req.params.id;
        if (ObjectId.isValid(id)) {
            const food = await pacienteService.getOne(id);
            if (!paciente) {
                res.status(404).json({error: "Paciente não encontrado."});
            } else {
                res.status(200).json({paciente});
            }
        } else {
            res.status(400).json({error: "ID inválido."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar Paciente."});
    }
};

export default { getAllPaciente, createPaciente, deletePaciente, updatePaciente, getOnePaciente };