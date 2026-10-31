import express from "express";
const fonoaudiologoRoutes = express.Router();
import fonoaudiologoController from "../controllers/FonoaudiologoController.js";
import Auth, { soFono } from "../middlewares/Auth.js";
import uploadFoto from "../middlewares/Upload.js";

fonoaudiologoRoutes.post('/fonoaudiologos', fonoaudiologoController.createFonoaudiologo);

fonoaudiologoRoutes.get('/fonoaudiologos/me/configuracoes', Auth, soFono, fonoaudiologoController.getConfiguracoes);
fonoaudiologoRoutes.put('/fonoaudiologos/me/configuracoes', Auth, soFono, fonoaudiologoController.putConfiguracoes);
fonoaudiologoRoutes.get('/fonoaudiologos/me', Auth, soFono, fonoaudiologoController.getMeFonoaudiologo);
fonoaudiologoRoutes.put('/fonoaudiologos/me', Auth, soFono, uploadFoto("foto_perfil"), fonoaudiologoController.updateFonoaudiologo);

export default fonoaudiologoRoutes;