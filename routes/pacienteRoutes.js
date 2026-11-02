
import express from "express";
import pacienteController from "../controllers/PacienteController.js";
import notaController from "../controllers/NotaClinicaController.js";
import Auth, { soFono } from "../middlewares/Auth.js";
import uploadFoto from "../middlewares/Upload.js";

const pacienteRoutes = express.Router();

pacienteRoutes.get(
  "/pacientes/meu-perfil",
  Auth,
  pacienteController.getMeuPerfil
);

pacienteRoutes.get(
  "/pacientes",
  Auth,
  soFono,
  pacienteController.getAllPaciente
);

pacienteRoutes.post(
  "/pacientes",
  Auth,
  soFono,
  uploadFoto("foto_perfil"),
  pacienteController.createPaciente
);

pacienteRoutes.get(
  "/pacientes/:id/notas",
  Auth,
  soFono,
  notaController.listar
);

pacienteRoutes.post(
  "/pacientes/:id/notas",
  Auth,
  soFono,
  notaController.criar
);

pacienteRoutes.put(
  "/pacientes/:id/notas/:notaId",
  Auth,
  soFono,
  notaController.alterar
);

pacienteRoutes.delete(
  "/pacientes/:id/notas/:notaId",
  Auth,
  soFono,
  notaController.remover
);

pacienteRoutes.get(
  "/pacientes/:id",
  Auth,
  soFono,
  pacienteController.getOnePaciente
);

pacienteRoutes.put(
  "/pacientes/:id",
  Auth,
  soFono,
  uploadFoto("foto_perfil"),
  pacienteController.updatePaciente
);

pacienteRoutes.delete(
  "/pacientes/:id",
  Auth,
  soFono,
  pacienteController.deletePaciente
);

pacienteRoutes.put(
  "/pacientes/:id/desativar",
  Auth,
  soFono,
  pacienteController.desativarPaciente
);

pacienteRoutes.put(
  "/pacientes/:id/ativar",
  Auth,
  soFono,
  pacienteController.ativarPaciente
);

pacienteRoutes.put(
  "/pacientes/:id/pin",
  Auth,
  soFono,
  pacienteController.definirPinPaciente
);

export default pacienteRoutes;
