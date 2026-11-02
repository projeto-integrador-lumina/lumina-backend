
import jwt from "jsonwebtoken";
import usuarioService from "../services/usuarioService.js";

const Auth = async (req, res, next) => {
  const authToken = req.headers["authorization"];

  if (!authToken) {
    return res.status(401).json({
      error: "Token de autenticação não fornecido.",
    });
  }

  const [tipo, token] = authToken.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Formato de token inválido.",
    });
  }

  const JWTSecret = process.env.JWTSECRET;

  if (!JWTSecret) {
    console.error("JWT_SECRET não está configurado.");

    return res.status(500).json({
      error: "Erro na configuração de autenticação.",
    });
  }

  try {
    const data = jwt.verify(token, JWTSecret);

    if (data.scope) {
      return res.status(401).json({
        error: "Token inválido ou expirado.",
      });
    }

    const usuario = await usuarioService.getById(data.id);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        error: "Conta desativada ou inexistente.",
      });
    }

    req.token = token;

    req.loggedUser = {
      id: data.id,
      usuario: data.usuario,
      tipo: data.tipo,
      idFono: data.idFono,
      idPaciente: data.idPaciente,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        error: "Token inválido ou expirado.",
      });
    }

    console.error(error);

    return res.status(500).json({
      error: "Erro interno do servidor.",
    });
  }
};

const soFono = (req, res, next) => {
  if (req.loggedUser?.tipo !== "Fono") {
    return res.status(403).json({
      error: "Acesso permitido apenas para fonoaudiólogos.",
    });
  }

  next();
};

const soPaciente = (req, res, next) => {
  if (req.loggedUser?.tipo !== "Paciente") {
    return res.status(403).json({
      error: "Acesso permitido apenas para pacientes.",
    });
  }

  next();
};

export { soFono, soPaciente };
export default Auth;
