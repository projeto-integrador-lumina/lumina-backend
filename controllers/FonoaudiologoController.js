import fonoaudiologoService from "../services/fonoaudiologoService.js";
import usuarioService from "../services/usuarioService.js";
import usuarioController from "./usuarioController.js";
import bcrypt from "bcrypt";

const SENHA_MIN = usuarioController.SENHA_MIN;

const createFonoaudiologo = async (req, res) => {
    let login = null;
    try {
        const { nome, email, crfa, telefone, usuario, senha } = req.body;
        if (!nome || !email || !crfa || !telefone || !usuario || !senha) {
            return res.status(400).json({ error: "Preencha todos os campos." });
        }
        if (String(senha).length < SENHA_MIN) {
            return res.status(400).json({ error: `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.` });
        }

        const username = String(usuario).trim().toLowerCase();
        const emailLimpo = String(email).trim().toLowerCase();
        const crfaLimpo = String(crfa).trim();

        if (await usuarioService.getOne(username)) {
            return res.status(409).json({ error: "Esse nome de usuário já está em uso." });
        }
        if (await fonoaudiologoService.getByCrfaOrEmail(crfaLimpo, emailLimpo)) {
            return res.status(409).json({ error: "Já existe um cadastro com esse CRFa ou e-mail." });
        }

        const hash = bcrypt.hashSync(String(senha), 10);
        login = await usuarioService.Create(username, hash, "Fono");

        await fonoaudiologoService.Create(nome, emailLimpo, crfaLimpo, telefone, undefined, login._id);

        res.status(201).json({ message: "Fonoaudiólogo cadastrado com sucesso!" });
    } catch (error) {
        if (login) await usuarioService.delete(login._id);
        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Dados inválidos. Confira os campos." });
        }
        res.status(500).json({ error: "Erro ao cadastrar fonoaudiólogo." });
    }
};

const getMeFonoaudiologo = async (req, res) => {
    try {
        const fono = await fonoaudiologoService.getOne(req.loggedUser.idFono);
        if (!fono) {
            return res.status(404).json({ error: "Fonoaudiólogo não encontrado." });
        }
        res.status(200).json({ fonoaudiologo: fono });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Erro ao buscar fonoaudiólogo." });
    }
};

const updateFonoaudiologo = async (req, res) => {
    try {
        const { nome, email, crfa, telefone, foto_perfil } = req.body;
        const fono = await fonoaudiologoService.update(req.loggedUser.idFono, nome, email, crfa, telefone, foto_perfil);
        if (!fono) {
            return res.status(404).json({ error: "Fonoaudiólogo não encontrado." });
        }
        res.status(200).json({ message: "Perfil atualizado com sucesso!", fonoaudiologo: fono });
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(409).json({ error: "Esse CRFa já está cadastrado." });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Dados inválidos. Confira os campos." });
        }
        res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
};

export default { createFonoaudiologo, getMeFonoaudiologo, updateFonoaudiologo };