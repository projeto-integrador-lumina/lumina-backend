
const origensPadrao = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://my-app-orpin-phi-25.vercel.app"
];

const escapar = (texto) =>
  texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const bate = (permitida, origem) => {
  if (!permitida.includes("*")) {
    return permitida === origem;
  }

  const regex = new RegExp(
    "^" +
      permitida
        .split("*")
        .map(escapar)
        .join("[a-z0-9-]+") +
      "$",
    "i"
  );

  return regex.test(origem);
};

const cors = (req, res, next) => {
  const bruto =
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    "";

  const origensConfiguradas = bruto
    .split(",")
    .map((origem) =>
      origem.trim().replace(/^["']|["']$/g, "")
    )
    .filter(Boolean);

  const permitidas = [
    ...new Set([
      ...origensPadrao,
      ...origensConfiguradas
    ])
  ];

  const origem = req.headers.origin;

  if (
    origem &&
    permitidas.some((permitida) =>
      bate(permitida, origem)
    )
  ) {
    res.setHeader("Access-Control-Allow-Origin", origem);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Responsavel-Token"
    );
    res.setHeader("Access-Control-Max-Age", "600");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

export default cors;
