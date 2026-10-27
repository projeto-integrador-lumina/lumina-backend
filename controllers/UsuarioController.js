import dotenv from 'dotenv';
dotenv.config();

import usuarioService from '../services/usuarioService.js';
import fonoaudiologoService from '../services/fonoaudiologoService.js';
import pacienteService from '../services/pacienteService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWTSecret = process.env.JWTSECRET;
const SENHA_MIN = 8;

const limpa = (v) => String(v || "").trim().toLowerCase();

// Login único: serve o dashboard (Fono) e o PWA (Paciente).
// Não existe "createUsuario": o Usuario nasce junto com a Fono (createFonoaudiologo)
// ou com o Paciente (createPaciente).
const loginUsuario = async (req, res) => {
    try {
        const { usuario, senha, manter } = req.body;
        if (!usuario || !senha) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
        }

        const user = await usuarioService.getOne(limpa(usuario));
        const correct = user ? bcrypt.compareSync(String(senha), user.senha) : false;

        // mesma resposta para "usuário não existe" e "senha errada"
        if (!correct) {
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }

        if (!user.ativo) {
            if (user.tipo === "Fono") {
                return res.status(403).json({ error: 'Essa conta está desativada.', contaDesativada: true });
            }
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }

        const payload = { id: user._id, usuario: user.usuario, tipo: user.tipo };
        let nome;

        if (user.tipo === "Fono") {
            const fono = await fonoaudiologoService.getByLogin(user._id);
            if (!fono) {
                return res.status(401).json({ error: 'Fonoaudiólogo não encontrado para esse login.' });
            }
            payload.idFono = fono._id;
            nome = fono.nome;
        } else {
            const paciente = await pacienteService.getByLogin(user._id);
            if (!paciente || !paciente.ativo) {
                return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
            }
            payload.idPaciente = paciente._id;
            nome = paciente.nome;
        }

        // "Manter-me conectado" (PWA) → token mais longo
        const expiresIn = manter ? '30d' : '48h';

        jwt.sign(payload, JWTSecret, { expiresIn }, (error, token) => {
            if (error) {
                res.status(400).json({ error: 'Não foi possível gerar o token de autenticação.' });
            } else {
                res.status(200).json({
                    token,
                    tipo: user.tipo,
                    nome,
                    precisaTrocarSenha: user.precisa_trocar_senha
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// trocar a PRÓPRIA senha (exige a senha atual)
const trocarSenha = async (req, res) => {
    try {
        const { senhaAtual, novaSenha } = req.body;
        if (!novaSenha || String(novaSenha).length < SENHA_MIN) {
            return res.status(400).json({ error: `A nova senha precisa ter pelo menos ${SENHA_MIN} caracteres.` });
        }

        const user = await usuarioService.getById(req.loggedUser.id);
        if (!bcrypt.compareSync(String(senhaAtual || ""), user.senha)) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const hash = bcrypt.hashSync(String(novaSenha), 10);
        await usuarioService.updateSenha(user._id, hash, false);
        res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao alterar senha.' });
    }
};

// a fono desativa a PRÓPRIA conta (nunca a de outro usuário)
const desativarUsuario = async (req, res) => {
    try {
        await usuarioService.setAtivo(req.loggedUser.id, false);
        res.status(200).json({ message: 'Conta desativada com sucesso!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao desativar conta.' });
    }
};

// reativar exige usuário E senha corretos
const reativarUsuario = async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const user = await usuarioService.getOne(limpa(usuario));

        if (!user || user.tipo !== "Fono" || !bcrypt.compareSync(String(senha || ""), user.senha)) {
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }

        await usuarioService.setAtivo(user._id, true);
        res.status(200).json({ message: 'Conta reativada com sucesso!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao reativar conta.' });
    }
};

export default { loginUsuario, trocarSenha, desativarUsuario, reativarUsuario, JWTSecret, SENHA_MIN };
