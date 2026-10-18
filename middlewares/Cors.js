const cors = (req, res, next) => {
    const permitidas = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origem = req.headers.origin;

    if (origem && (permitidas.length === 0 || permitidas.includes(origem))) {
        res.setHeader("Access-Control-Allow-Origin", permitidas.length === 0 ? "*" : origem);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Responsavel-Token");
        res.setHeader("Access-Control-Max-Age", "600");
    }

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
};

export default cors;