import express from "express";
const atividadeConfRoutes = express.Router();
import atividadeConfController from "../controllers/AtividadeConfController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

atividadeConfRoutes.get('/atividades', Auth, soFono, atividadeConfController.getAllAtividadeConf);
atividadeConfRoutes.post('/atividades', Auth, soFono, atividadeConfController.createAtividadeConf);
atividadeConfRoutes.get('/atividades/:id', Auth, soFono, atividadeConfController.getOneAtividadeConf);
atividadeConfRoutes.delete('/atividades/:id', Auth, soFono, atividadeConfController.deleteAtividadeConf);

export default atividadeConfRoutes;
