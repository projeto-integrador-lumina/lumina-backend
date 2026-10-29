import express from "express";
import mongoose from "./config/db-connection.js";
import cors from "./middlewares/cors.js";

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
import palavraRoutes from "./routes/palavraRoutes.js";
import atividadeRoutes from "./routes/atividadeRoutes.js";
import mensagemRoutes from "./routes/mensagemRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import appRoutes from "./routes/appRoutes.js";

const app = express();

app.use(cors);
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/api", usuarioRoutes);
app.use("/api", fonoaudiologoRoutes);
app.use("/api", pacienteRoutes);
app.use("/api", palavraRoutes);
app.use("/api", atividadeRoutes);
app.use("/api", mensagemRoutes);
app.use("/api", relatorioRoutes);
app.use("/api", appRoutes);

const port = process.env.PORT || 8080;
app.listen(port, (error) => {
    if (error) {
        console.log("Ocorreu um erro ao iniciar a API!" + error);
    } else {
        console.log("API iniciada com sucesso na porta " + port);
    }
});