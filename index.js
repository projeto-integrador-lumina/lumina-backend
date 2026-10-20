import express from "express";
import mongoose from "./config/db-connection.js";

import Fonoaudiologo from "./models/Fonoaudiologo.js";
import Paciente from "./models/Paciente.js";
import Usuario from "./models/Usuario.js"

import pacienteRoutes from "./routes/pacienteRoutes.js";
import fonoaudiologoRoutes from "./routes/fonoaudiologoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import atividadeRoutes from "./routes/atividadeRoutes.js";

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/api", pacienteRoutes);
app.use("/api", fonoaudiologoRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", atividadeRoutes);

const port = process.env.PORT || 8080;
app.listen(port, (error) => {
    if (error) {
        console.log("Ocorreu um erro ao iniciar a API!" + error);
    } else {
        console.log("API iniciada com sucesso na porta " + port);
    }
});