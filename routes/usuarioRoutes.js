import express from "express";
const usuarioRoutes = express.Router();
import usuarioController from "../controllers/usuarioController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

usuarioRoutes.post('/auth/login', usuarioController.loginUsuario);
usuarioRoutes.post('/auth/reativar', usuarioController.reativarUsuario);
usuarioRoutes.put('/auth/senha', Auth, usuarioController.trocarSenha);
usuarioRoutes.put('/auth/desativar', Auth, soFono, usuarioController.desativarUsuario);

export default usuarioRoutes;
