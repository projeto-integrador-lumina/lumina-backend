import express from "express";
const palavraRoutes = express.Router();
import palavraController from "../controllers/PalavraController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

palavraRoutes.get('/palavras', Auth, soFono, palavraController.getAllPalavra);

export default palavraRoutes;
