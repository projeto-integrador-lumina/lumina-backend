import mensagemService from "../services/mensagemService.js";
import pacienteService from "../services/pacienteService.js";
import usuarioController from "./usuarioController.js";
import { pacienteDaFono } from "../utils/acesso.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWTSecret = usuarioController.JWTSecret;

const MAX_ERROS_PIN = 5;
const BLOQUEIO_MIN = 15;
const VALIDADE_TOKEN_S = 600; // 10 minutos

const textoValido = (t) => typeof t === "string" && t.trim().length > 0 && t.trim().length <= 1000;

/* ------------------------- lado da fono ------------------------- */

// lista de conversas: só pacientes que já têm mensagens, mais recentes primeiro
const getConversas = async (req, res) => {
    try {
        const pacientes = await pacienteService.getAll(req.loggedUser.idFono);
        const resumo = await mensagemService.resumoDaFono(req.loggedUser.idFono);

        const conversas = pacientes
            .filter((p) => resumo.has(String(p._id)))
            .map((p) => {
                const r = resumo.get(String(p._id));
                return {
                    id_paciente: p._id,
                    nome: `${p.nome} ${p.sobrenome}`,
                    ultima: { texto: r.ultima.texto, autor: r.ultima.autor, createdAt: r.ultima.createdAt },
                    nao_lidas: r.nao_lidas
                };
            })
            .sort((a, b) => b.ultima.createdAt - a.ultima.createdAt);

        res.status(200).json({conversas});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar conversas."});
    }
};

const getMensagens = async (req, res) => {
    try {
        const acesso = await pacienteDaFono(req.params.id_paciente, req.loggedUser.idFono);
        if (acesso.error) return res.status(acesso.status).json({error: acesso.error});

        const mensagens = await mensagemService.getConversa(acesso.paciente._id);
        await mensagemService.marcarLidas(acesso.paciente._id, "responsavel"); // a fono leu
        res.status(200).json({mensagens});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar mensagens."});
    }
};

const createMensagem = async (req, res) => {
    try {
        if (!textoValido(req.body.texto)) {
            return res.status(400).json({error: "Digite uma mensagem de até 1000 caracteres."});
        }
        const acesso = await pacienteDaFono(req.params.id_paciente, req.loggedUser.idFono);
        if (acesso.error) return res.status(acesso.status).json({error: acesso.error});

        const mensagem = await mensagemService.Create(acesso.paciente._id, req.loggedUser.idFono, "fono", req.body.texto);
        res.status(201).json({mensagem});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao enviar mensagem."});
    }
};

/* ------------------------- lado do PWA ------------------------- */

// o modal "Digite a senha do responsável": troca o PIN por um token curto
const desbloquearMensagens = async (req, res) => {
    try {
        const pin = String(req.body.pin || "");
        const paciente = await pacienteService.getComPin(req.loggedUser.idPaciente);

        if (!paciente || !paciente.pin_responsavel) {
            return res.status(409).json({error: "O responsável ainda não tem PIN. Peça para a fonoaudióloga cadastrar."});
        }

        if (paciente.pin_bloqueado_ate && paciente.pin_bloqueado_ate > new Date()) {
            const minutos = Math.ceil((paciente.pin_bloqueado_ate - new Date()) / 60000);
            return res.status(429).json({error: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).`});
        }

        if (!bcrypt.compareSync(pin, paciente.pin_responsavel)) {
            const erros = (paciente.pin_tentativas || 0) + 1;
            if (erros >= MAX_ERROS_PIN) {
                await pacienteService.registrarErroPin(paciente._id, 0, new Date(Date.now() + BLOQUEIO_MIN * 60000));
                return res.status(429).json({error: `Muitas tentativas. Tente novamente em ${BLOQUEIO_MIN} minutos.`});
            }
            await pacienteService.registrarErroPin(paciente._id, erros, null);
            return res.status(401).json({error: "PIN incorreto."});
        }

        await pacienteService.zerarErrosPin(paciente._id);

        // "scope" impede que este token sirva como token de login (e vice-versa)
        const token = jwt.sign(
            { idPaciente: String(paciente._id), scope: "mensagens" },
            JWTSecret,
            { expiresIn: VALIDADE_TOKEN_S }
        );
        res.status(200).json({token_responsavel: token, expira_em_segundos: VALIDADE_TOKEN_S});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao validar PIN."});
    }
};

const getMensagensApp = async (req, res) => {
    try {
        const paciente = await pacienteService.getOne(req.loggedUser.idPaciente);
        const mensagens = await mensagemService.getConversa(paciente._id);
        await mensagemService.marcarLidas(paciente._id, "fono"); // o responsável leu
        res.status(200).json({mensagens});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar mensagens."});
    }
};

const createMensagemApp = async (req, res) => {
    try {
        if (!textoValido(req.body.texto)) {
            return res.status(400).json({error: "Digite uma mensagem de até 1000 caracteres."});
        }
        const paciente = await pacienteService.getOne(req.loggedUser.idPaciente);
        const mensagem = await mensagemService.Create(paciente._id, paciente.id_fono, "responsavel", req.body.texto);
        res.status(201).json({mensagem});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao enviar mensagem."});
    }
};

export default {
    getConversas, getMensagens, createMensagem,
    desbloquearMensagens, getMensagensApp, createMensagemApp
};
