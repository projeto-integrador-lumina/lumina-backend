import jwt from "jsonwebtoken";
import usuarioController from "../controllers/UsuarioController.js";

const JWTSecret = usuarioController.JWTSecret;


const AuthResponsavel = (req, res, next) => {
    const aviso = { error: "Digite a senha do responsável para acessar as mensagens.", precisaPin: true };
    const token = req.headers["x-responsavel-token"];
    if (!token) return res.status(401).json(aviso);

    jwt.verify(token, JWTSecret, (error, data) => {
        if (error || data.scope !== "mensagens" || data.idPaciente !== req.loggedUser.idPaciente) {
            return res.status(401).json(aviso);
        }
        next();
    });
};

export default AuthResponsavel;
