import multer from "multer";
import path from "path";
import fs from "fs";

const PASTA_UPLOADS = "uploads";

// cria a pasta automaticamente se ela não existir
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PASTA_UPLOADS),
    filename: (req, file, cb) => {
        const nomeUnico = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, nomeUnico + path.extname(file.originalname).toLowerCase());
    },
});

const fileFilter = (req, file, cb) => {
    const permitidos = ["image/png", "image/jpeg", "image/webp"];
    if (permitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Formato inválido. Use PNG, JPG ou WEBP."));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Uso na rota: uploadFoto("foto_perfil")
// Devolve erro 400 (em vez de 500) quando o arquivo é inválido ou grande demais
const uploadFoto = (campo) => (req, res, next) => {
    upload.single(campo)(req, res, (err) => {
        if (err) {
            const mensagem =
                err.code === "LIMIT_FILE_SIZE"
                    ? "A foto deve ter no máximo 10 MB."
                    : err.message;
            return res.status(400).json({ error: mensagem });
        }
        next();
    });
};

export default uploadFoto;