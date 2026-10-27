// CORS sem dependência extra. A autenticação é por header (Bearer), não por cookie,
// então liberar origens não abre brecha de CSRF.
//
// .env:  CORS_ORIGINS=https://my-app-orpin-phi-25.vercel.app,https://*.vercel.app,http://localhost:5173
//   - lista separada por vírgula; "*" vale para UM trecho do endereço (ex.: previews da Vercel)
//   - sem CORS_ORIGINS (desenvolvimento) libera qualquer origem; em produção, liste as origens.
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

        // o Chrome exige isto quando um site HTTPS (Vercel) chama uma API em localhost
        if (req.headers["access-control-request-private-network"] === "true") {
            res.setHeader("Access-Control-Allow-Private-Network", "true");
        }
    }

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
};

export default cors;
