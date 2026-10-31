import express from "express";
const tarefaRoutes = express.Router();
import tarefaController from "../controllers/TarefaController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

tarefaRoutes.get('/tarefas', Auth, soFono, tarefaController.getAllTarefa);
tarefaRoutes.get('/tarefas/:id', Auth, soFono, tarefaController.getOneTarefa);
tarefaRoutes.delete('/tarefas/:id', Auth, soFono, tarefaController.deleteTarefa);

export default tarefaRoutes;