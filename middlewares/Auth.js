import jwt from "jsonwebtoken";
import usuarioController from "../controllers/usuarioController.js";
import usuarioService from "../services/usuarioService.js";

const JWTSecret = usuarioController.JWTSecret;

// Exige o header:  Authorization: Bearer <token>
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

        // tokens de escopo restrito (ex.: o do responsável nas mensagens) não servem como login
        if (data.scope) {
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }

        try {
            // confere no banco: se o usuário foi desativado, o token antigo deixa de valer
            const usuario = await usuarioService.getById(data.id);
            if (!usuario || !usuario.ativo) {
                return res.status(401).json({ error: "Conta desativada ou inexistente." });
            }

            req.token = token;
            req.loggedUser = {
                id: data.id,               // id do Usuario (login)
                usuario: data.usuario,
                tipo: data.tipo,           // "Fono" | "Paciente"
                idFono: data.idFono,       // só no token da fono
                idPaciente: data.idPaciente // só no token do paciente
            };
            next();
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    });
};

// usados depois do Auth:  router.get('/x', Auth, soFono, controller.x)
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
