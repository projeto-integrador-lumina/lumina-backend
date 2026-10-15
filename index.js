import express from "express";
import mongoose from "./config/db-connection.js";

import Fonoaudiologo from "./models/Fonoaudiologo.js";
import Paciente from "./models/Paciente.js";
import Usuario from "./models/Usuario.js"

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const port = process.env.PORT || 8080;
app.listen(port, (error) => {
    if (error) {
        console.log("Ocorreu um erro ao iniciar a API!" + error);
    } else {
        console.log("API iniciada com sucesso na porta " + port);
    }
});