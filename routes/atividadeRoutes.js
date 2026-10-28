import express from "express";
const atividadeRoutes = express.Router();
import atividadeController from "../controllers/atividadeController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

atividadeRoutes.get('/atividades', Auth, soFono, atividadeController.getAllAtividade);
atividadeRoutes.post('/atividades', Auth, soFono, atividadeController.createAtividade);
atividadeRoutes.get('/atividades/:id', Auth, soFono, atividadeController.getOneAtividade);
atividadeRoutes.delete('/atividades/:id', Auth, soFono, atividadeController.deleteAtividade);

export default atividadeRoutes;
