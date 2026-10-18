import express from "express";
const pacienteRoutes = express.Router();
import pacienteController from "../controllers/pacienteController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

pacienteRoutes.get('/pacientes', Auth, soFono, pacienteController.getAllPaciente);
pacienteRoutes.post('/pacientes', Auth, soFono, pacienteController.createPaciente);
pacienteRoutes.get('/pacientes/:id', Auth, soFono, pacienteController.getOnePaciente);
pacienteRoutes.put('/pacientes/:id', Auth, soFono, pacienteController.updatePaciente);
pacienteRoutes.delete('/pacientes/:id', Auth, soFono, pacienteController.deletePaciente);
pacienteRoutes.put('/pacientes/:id/pin', Auth, soFono, pacienteController.definirPinPaciente);
pacienteRoutes.post('/pacientes/:id/resetar-senha', Auth, soFono, pacienteController.resetarSenhaPaciente);

export default pacienteRoutes;