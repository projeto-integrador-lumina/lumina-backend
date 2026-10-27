import jwt from "jsonwebtoken";
import usuarioController from "../controllers/usuarioController.js";

const JWTSecret = usuarioController.JWTSecret;

// Usado DEPOIS de Auth + soPaciente nas rotas de mensagens do PWA.
// Exige o header  X-Responsavel-Token  obtido em POST /api/app/mensagens/desbloquear
const AuthResponsavel = (req, res, next) => {
    const aviso = { error: "Digite a senha do responsável para acessar as mensagens.", precisaPin: true };
    const token = req.headers["x-responsavel-token"];
    if (!token) return res.status(401).json(aviso);

    jwt.verify(token, JWTSecret, (error, data) => {
        // precisa ser um token de escopo "mensagens" DESTE paciente (um token de login comum não serve)
        if (error || data.scope !== "mensagens" || data.idPaciente !== req.loggedUser.idPaciente) {
            return res.status(401).json(aviso);
        }
        next();
    });
};

export default AuthResponsavel;
