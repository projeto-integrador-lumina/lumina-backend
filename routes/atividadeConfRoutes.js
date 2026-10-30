import express from "express";
const atividadeConfRoutes = express.Router();
import atividadeConfController from "../controllers/AtividadeConfController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

atividadeConfRoutes.get('/missoes', Auth, soFono, atividadeConfController.getAllAtividadeConf);
atividadeConfRoutes.post('/missoes', Auth, soFono, atividadeConfController.createAtividadeConf);
atividadeConfRoutes.get('/missoes/:id', Auth, soFono, atividadeConfController.getOneAtividadeConf);
atividadeConfRoutes.delete('/missoes/:id', Auth, soFono, atividadeConfController.deleteAtividadeConf);

export default atividadeConfRoutes;
