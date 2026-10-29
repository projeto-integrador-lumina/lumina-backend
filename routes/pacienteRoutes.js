import express from "express";
const pacienteRoutes = express.Router();
import pacienteController from "../controllers/PacienteController.js";
import Auth, { soFono } from "../middlewares/Auth.js";
import uploadFoto from "../middlewares/Upload.js";

pacienteRoutes.get('/pacientes', Auth, soFono, pacienteController.getAllPaciente);
pacienteRoutes.post('/pacientes', Auth, soFono, uploadFoto("foto_perfil"), pacienteController.createPaciente);
pacienteRoutes.get('/pacientes/:id', Auth, soFono, pacienteController.getOnePaciente);
pacienteRoutes.put('/pacientes/:id', Auth, soFono, uploadFoto("foto_perfil"), pacienteController.updatePaciente);
pacienteRoutes.delete('/pacientes/:id', Auth, soFono, pacienteController.deletePaciente); // = desativar
pacienteRoutes.put('/pacientes/:id/desativar', Auth, soFono, pacienteController.desativarPaciente);
pacienteRoutes.put('/pacientes/:id/ativar', Auth, soFono, pacienteController.ativarPaciente);
pacienteRoutes.put('/pacientes/:id/pin', Auth, soFono, pacienteController.definirPinPaciente);
pacienteRoutes.post('/pacientes/:id/resetar-senha', Auth, soFono, pacienteController.resetarSenhaPaciente);

export default pacienteRoutes;
