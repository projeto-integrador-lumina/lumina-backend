const escapar = (txt) => txt.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

const bate = (permitida, origem) => {
    if (!permitida.includes("*")) return permitida === origem;
    const regex = new RegExp("^" + permitida.split("*").map(escapar).join("[a-z0-9-]+") + "$", "i");
    return regex.test(origem);
};

const cors = (req, res, next) => {
    const permitidas = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origem = req.headers.origin;

    if (origem && (permitidas.length === 0 || permitidas.some((p) => bate(p, origem)))) {
        res.setHeader("Access-Control-Allow-Origin", permitidas.length === 0 ? "*" : origem);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Responsavel-Token");
        res.setHeader("Access-Control-Max-Age", "600");

        if (req.headers["access-control-request-private-network"] === "true") {
            res.setHeader("Access-Control-Allow-Private-Network", "true");
        }
    }

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
};

export default cors;
