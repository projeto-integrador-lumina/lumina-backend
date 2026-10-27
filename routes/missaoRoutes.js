import express from "express";
const missaoRoutes = express.Router();
import missaoController from "../controllers/missaoController.js";
import Auth, { soFono } from "../middlewares/Auth.js";

missaoRoutes.get('/missoes', Auth, soFono, missaoController.getAllMissao);
missaoRoutes.post('/missoes', Auth, soFono, missaoController.createMissao);
missaoRoutes.get('/missoes/:id', Auth, soFono, missaoController.getOneMissao);
missaoRoutes.delete('/missoes/:id', Auth, soFono, missaoController.deleteMissao);

export default missaoRoutes;
