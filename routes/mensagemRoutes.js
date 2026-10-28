import express from "express";
const mensagemRoutes = express.Router();
import mensagemController from "../controllers/MensagemController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

mensagemRoutes.get('/mensagens', Auth, soFono, mensagemController.getConversas);
mensagemRoutes.get('/mensagens/:id_paciente', Auth, soFono, mensagemController.getMensagens);
mensagemRoutes.post('/mensagens/:id_paciente', Auth, soFono, mensagemController.createMensagem);

export default mensagemRoutes;
