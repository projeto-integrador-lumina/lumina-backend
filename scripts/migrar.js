import mongoose from "../config/db-connection.js";
import Palavra from "../models/Palavra.js";
import Atividade from "../models/Atividade.js";

const run = async () => {
    const p = await Palavra.collection.updateMany(
        { categoria_som: { $in: ["líquido", "Líquido", "liquido "] } },
        { $set: { categoria_som: "liquido" } }
    );
    console.log(`Palavras corrigidas: ${p.modifiedCount}`);

    const a = await Atividade.collection.updateMany(
        { fonema: { $exists: true } },
        [
            {
                $set: {
                    fonemas: [{ $trim: { input: { $toString: "$fonema" } } }],
                    posicoes: {
                        $filter: {
                            input: [{ $toLower: { $trim: { input: { $toString: { $ifNull: ["$posicao", ""] } } } } }],
                            cond: { $in: ["$$this", ["inicial", "medial", "final"]] }
                        }
                    },
                    dias_semana: []
                }
            },
            { $unset: ["fonema", "posicao", "frequencia"] }
        ]
    );
    console.log(`Atividades convertidas: ${a.modifiedCount}`);

    await mongoose.disconnect();
};

run().catch((error) => {
    console.log("Erro na migração: " + error);
    process.exit(1);
});