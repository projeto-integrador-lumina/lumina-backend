import express from "express";
const atividadeRoutes = express.Router();
import atividadeController from "../controllers/AtividadeController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

atividadeRoutes.get('/atividades', Auth, atividadeController.getAllAtividade);
atividadeRoutes.post('/atividades', Auth, soFono, atividadeController.createAtividade);
atividadeRoutes.get('/atividades/:id', Auth, atividadeController.getOneAtividade);
atividadeRoutes.put('/atividades/:id', Auth, soFono, atividadeController.updateAtividade);
atividadeRoutes.delete('/atividades/:id', Auth, soFono, atividadeController.deleteAtividade);

export default atividadeRoutes;