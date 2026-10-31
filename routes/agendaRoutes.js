import express from "express";
const agendaRoutes = express.Router();
import agendaController from "../controllers/AgendaController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

agendaRoutes.get('/agenda', Auth, soFono, agendaController.getAgenda);

export default agendaRoutes;