import express from "express";
const fonoaudiologoRoutes = express.Router();
import fonoaudiologoController from "../controllers/fonoaudiologoController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

// cadastro é público (a fono ainda não tem conta)
fonoaudiologoRoutes.post('/fonoaudiologos', fonoaudiologoController.createFonoaudiologo);

// perfil da fono logada ("me" vem do token, não da URL)
fonoaudiologoRoutes.get('/fonoaudiologos/me', Auth, soFono, fonoaudiologoController.getMeFonoaudiologo);
fonoaudiologoRoutes.put('/fonoaudiologos/me', Auth, soFono, fonoaudiologoController.updateFonoaudiologo);

export default fonoaudiologoRoutes;
