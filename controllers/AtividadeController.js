import atividadeService from "../services/atividadeService.js";
import tarefaService from "../services/tarefaService.js";
import palavraService from "../services/palavraService.js";
import notificacaoService from "../services/notificacaoService.js";
import pacienteService from "../services/pacienteService.js";
import { POSICOES } from "../models/Atividade.js";

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

const definirAlvoAtual = (id_paciente, fonemas) =>
    pacienteService.setCampos(id_paciente, { alvo_atual: fonemas.join(", ") });

const unicos = (lista) => [...new Set(lista)];

const lerDados = (body, obrigatorio) => {
    const dados = {};

    if (body.fonemas !== undefined || obrigatorio) {
        if (!Array.isArray(body.fonemas)) return {erro: "fonemas deve ser uma lista, ex.: [\"/s/\", \"/r/\"]."};
        const fonemas = unicos(body.fonemas.map((f) => String(f).trim()).filter(Boolean));
        if (!fonemas.length) return {erro: "Selecione ao menos um fonema."};
        if (fonemas.length > 30) return {erro: "Fonemas demais."};
        dados.fonemas = fonemas;
    }

    if (body.posicoes !== undefined) {
        if (!Array.isArray(body.posicoes)) return {erro: "posicoes deve ser uma lista (inicial, medial, final)."};
        const posicoes = unicos(body.posicoes.map((p) => String(p).trim().toLowerCase()));
        if (!posicoes.every((p) => POSICOES.includes(p))) return {erro: `posicoes aceita: ${POSICOES.join(", ")}.`};
        dados.posicoes = posicoes;
    }

    if (body.dias_semana !== undefined) {
        if (!Array.isArray(body.dias_semana)) return {erro: "dias_semana deve ser uma lista de 0 (domingo) a 6 (sábado)."};
        const dias = unicos(body.dias_semana.map(Number));
        if (!dias.every((n) => Number.isInteger(n) && n >= 0 && n <= 6)) return {erro: "dias_semana deve conter números de 0 (domingo) a 6 (sábado)."};
        dados.dias_semana = dias.sort((a, b) => a - b);
    }

    if (body.tempo_pratica !== undefined) {
        const t = Number(body.tempo_pratica);
        if (!Number.isInteger(t) || t < 1 || t > 240) return {erro: "tempo_pratica deve ser um número inteiro de 1 a 240 (minutos)."};
        dados.tempo_pratica = t;
    }

    return {dados};
};

const embaralhar = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const TITULO_PADRAO = { treino: "Treinamento de Fonema", missao: "Missão do dia" };

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
        const { id_paciente } = req.body;
        if (!id_paciente) {
            return res.status(400).json({error: "Selecione o paciente."});
        }

        const lido = lerDados(req.body, true);
        if (lido.erro) return res.status(400).json({error: lido.erro});

        const acesso = await pacienteDaFono(id_paciente, req.loggedUser.idFono);
        if (acesso.error) return res.status(acesso.status).json({error: acesso.error});

        const atividade = await atividadeService.Create(id_paciente, req.loggedUser.idFono, lido.dados);
        await definirAlvoAtual(acesso.paciente._id, lido.dados.fonemas);
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
        if (!ObjectId.isValid(id)) return res.status(400).json({error: "ID inválido."});

        const atividade = await atividadeService.getOne(id);
        if (!atividade) {
            return res.status(404).json({error: "Atividade não encontrada."});
        }
        if (atividade.id_fono.toString() !== req.loggedUser.idFono) {
            return res.status(403).json({error: "Você não tem permissão para atualizar esta atividade."});
        }

        const lido = lerDados(req.body, false);
        if (lido.erro) return res.status(400).json({error: lido.erro});
        if (!Object.keys(lido.dados).length) return res.status(400).json({error: "Nenhum campo para atualizar."});

        const atualizada = await atividadeService.update(id, lido.dados);
        if (lido.dados.fonemas) await definirAlvoAtual(atividade.id_paciente, lido.dados.fonemas);
        res.status(200).json({message: "Atividade atualizada com sucesso!", atividade: atualizada});
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

const gerarTreino = async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.status(400).json({error: "ID inválido."});

        const atividade = await atividadeService.getOne(id);
        if (!atividade) return res.status(404).json({error: "Atividade não encontrada."});
        if (atividade.id_fono.toString() !== req.loggedUser.idFono) {
            return res.status(403).json({error: "Você não tem permissão para esta atividade."});
        }

        const tipo = req.body.tipo === undefined ? "treino" : req.body.tipo;
        if (!["treino", "missao"].includes(tipo)) {
            return res.status(400).json({error: 'tipo deve ser "treino" ou "missao".'});
        }
        const limite = req.body.limite === undefined ? 10 : Number(req.body.limite);
        if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
            return res.status(400).json({error: "limite deve ser um número de 1 a 20."});
        }
        const titulo = req.body.titulo;
        if (titulo !== undefined && (typeof titulo !== "string" || titulo.length > 80)) {
            return res.status(400).json({error: "Título inválido (máximo de 80 caracteres)."});
        }

        const acesso = await pacienteDaFono(atividade.id_paciente.toString(), req.loggedUser.idFono);
        if (acesso.error) return res.status(acesso.status).json({error: acesso.error});

        const encontradas = await palavraService.buscar({ fonemas: atividade.fonemas, posicoes: atividade.posicoes });
        if (!encontradas.length) {
            return res.status(409).json({error: "Não há palavras cadastradas para esses fonemas/posições."});
        }

        const ids = embaralhar(encontradas).slice(0, limite).map((p) => p._id);
        const tarefa = await tarefaService.Create(
            req.loggedUser.idFono, acesso.paciente._id, tipo, (titulo || "").trim() || TITULO_PADRAO[tipo], ids
        );

        await notificacaoService.Create(
            acesso.paciente._id,
            "atividade",
            tipo === "missao"
                ? "Sua fonoaudióloga enviou uma nova missão para você! Vamos conferir?"
                : "Sua fonoaudióloga enviou um novo treino para você! Vamos conferir?"
        );

        res.status(201).json({message: "Treino gerado e enviado para a criança!", tarefa, total_palavras: ids.length});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao gerar treino."});
    }
};

export default { getAllAtividade, getOneAtividade, createAtividade, updateAtividade, deleteAtividade, gerarTreino };