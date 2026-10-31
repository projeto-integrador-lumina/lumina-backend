import express from "express";
import mongoose from "./config/db-connection.js";
import cors from "./middlewares/Cors.js";
import path from "path";
import { fileURLToPath } from "url";

import Fonoaudiologo from "./models/Fonoaudiologo.js";
import Paciente from "./models/Paciente.js";
import Usuario from "./models/Usuario.js"
import Palavra from "./models/Palavra.js";
import Nivel from "./models/Nivel.js";
import Item from "./models/Item.js";
import Atividade from "./models/Atividade.js";
import Tentativa from "./models/Tentativa.js";
import Mensagem from "./models/Mensagem.js";
import Notificacao from "./models/Notificacao.js";

import usuarioRoutes from "./routes/usuarioRoutes.js";
import fonoaudiologoRoutes from "./routes/fonoaudiologoRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";
import atividadeRoutes from "./routes/atividadeRoutes.js";
import tarefaRoutes from "./routes/tarefaRoutes.js";
import "./models/Tarefa.js";
import mensagemRoutes from "./routes/mensagemRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import agendaRoutes from "./routes/agendaRoutes.js";

const app = express();

app.use(cors);
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

app.use("/api", usuarioRoutes);
app.use("/api", fonoaudiologoRoutes);
app.use("/api", pacienteRoutes);
app.use("/api", atividadeRoutes);
app.use("/api", tarefaRoutes);
app.use("/api", mensagemRoutes);
app.use("/api", relatorioRoutes);
app.use("/api", appRoutes);
app.use("/api", agendaRoutes);

const port = process.env.PORT || 8080;
app.listen(port, (error) => {
    if (error) {
        console.log("Ocorreu um erro ao iniciar a API!" + error);
    } else {
        console.log("API iniciada com sucesso na porta " + port);
    }
});