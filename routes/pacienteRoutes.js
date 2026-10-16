import express from "express";
const pacienteRoutes = express.Router();
import pacienteController from "../controllers/pacienteController.js";

pacienteRoutes.get('/pacientes', pacienteController.getAllPacientes);
pacienteRoutes.post('/pacientes', pacienteController.createPaciente);
pacienteRoutes.delete('/pacientes/:id', pacienteController.deletePaciente);
pacienteRoutes.put('/pacientes/:id', pacienteController.updatePaciente);
pacienteRoutes.get('/pacientes/:id', pacienteController.getOnePaciente);

export default pacienteRoutes;