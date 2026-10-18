import express from "express";
const relatorioRoutes = express.Router();
import relatorioController from "../controllers/relatorioController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

relatorioRoutes.get('/relatorios/resumo', Auth, soFono, relatorioController.getResumo);
relatorioRoutes.get('/relatorios/fonema', Auth, soFono, relatorioController.getFonema);
relatorioRoutes.get('/relatorios/atividade', Auth, soFono, relatorioController.getAtividade);
relatorioRoutes.get('/relatorios/evolucao', Auth, soFono, relatorioController.getEvolucao);

export default relatorioRoutes;