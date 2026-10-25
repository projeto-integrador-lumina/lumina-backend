import express from "express";
const mensagemRoutes = express.Router();
import mensagemController from "../controllers/MensagemController.js";
import Auth from "../middlewares/Auth.js";

// fono e paciente (responsável, no PWA) usam as mesmas rotas; o controller confere de quem é a conversa
mensagemRoutes.get('/conversas', Auth, mensagemController.getAllConversa);
mensagemRoutes.post('/conversas', Auth, mensagemController.createConversa);
mensagemRoutes.get('/conversas/:id/mensagens', Auth, mensagemController.getMensagens);
mensagemRoutes.post('/conversas/:id/mensagens', Auth, mensagemController.createMensagem);
mensagemRoutes.patch('/mensagens/:id/lida', Auth, mensagemController.marcarLida);
mensagemRoutes.delete('/mensagens/:id', Auth, mensagemController.deleteMensagem);

export default mensagemRoutes;