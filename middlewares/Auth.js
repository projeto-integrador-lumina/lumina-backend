import jwt from "jsonwebtoken";
import usuarioController from "../controllers/usuarioController.js";
import usuarioService from "../services/usuarioService.js";

const JWTSecret = usuarioController.JWTSecret;

const Auth = (req, res, next) => {
    const authToken = req.headers["authorization"];
    if (!authToken) {
        return res.status(401).json({ error: "Token de autenticação não fornecido." });
    }

    const token = authToken.split(" ")[1];

    jwt.verify(token, JWTSecret, async (error, data) => {
        if (error) {
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }

        if (data.scope) {
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }

        try {
            const usuario = await usuarioService.getById(data.id);
            if (!usuario || !usuario.ativo) {
                return res.status(401).json({ error: "Conta desativada ou inexistente." });
            }

            req.token = token;
            req.loggedUser = {
                id: data.id,               
                usuario: data.usuario,
                tipo: data.tipo,           
                idFono: data.idFono,       
                idPaciente: data.idPaciente 
            };
            next();
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    });
};

const soFono = (req, res, next) => {
    if (req.loggedUser.tipo !== "Fono") {
        return res.status(403).json({ error: "Acesso permitido apenas para fonoaudiólogos." });
    }
    next();
};

const soPaciente = (req, res, next) => {
    if (req.loggedUser.tipo !== "Paciente") {
        return res.status(403).json({ error: "Acesso permitido apenas para pacientes." });
    }
    next();
};

export { soFono, soPaciente };
export default Auth;