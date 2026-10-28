import express from "express";
const fonoaudiologoRoutes = express.Router();
import fonoaudiologoController from "../controllers/fonoaudiologoController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

fonoaudiologoRoutes.post('/fonoaudiologos', fonoaudiologoController.createFonoaudiologo);

fonoaudiologoRoutes.get('/fonoaudiologos/me', Auth, soFono, fonoaudiologoController.getMeFonoaudiologo);
fonoaudiologoRoutes.put('/fonoaudiologos/me', Auth, soFono, fonoaudiologoController.updateFonoaudiologo);

export default fonoaudiologoRoutes;
