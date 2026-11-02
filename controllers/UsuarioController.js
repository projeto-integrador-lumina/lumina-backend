
import express from "express";
import usuarioController from "../controllers/UsuarioController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

const usuarioRoutes = express.Router();

usuarioRoutes.post(
  "/auth/login",
  usuarioController.loginUsuario
);

usuarioRoutes.post(
  "/auth/reativar",
  usuarioController.reativarUsuario
);

usuarioRoutes.put(
  "/auth/senha",
  Auth,
  soFono,
  usuarioController.trocarSenha
);

usuarioRoutes.put(
  "/auth/desativar",
  Auth,
  soFono,
  usuarioController.desativarUsuario
);

usuarioRoutes.post(
  "/auth/recuperar-senha/buscar",
  usuarioController.buscarUsuarioRecuperacao
);

usuarioRoutes.put(
  "/auth/recuperar-senha",
  Auth,
  soFono,
  usuarioController.redefinirSenhaAdministrativa
);

export default usuarioRoutes;
