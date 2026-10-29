export const CATEGORIAS = ["liquido", "explosivo", "nasal", "fricativo"];

export const ROTULOS = {
    liquido: "Sons líquidos",
    explosivo: "Sons explosivos",
    nasal: "Sons nasais",
    fricativo: "Sons fricativos"
};

export const XP_POR_ACERTO = 10;         
export const MOEDAS_PRIMEIRO_ACERTO = 5;  
export const XP_POR_NIVEL = 100;
export const MOEDAS_MISSAO = 20;
export const MOEDAS_TREINO = 10;

export const nivelDoJogador = (xp) => Math.floor(xp / XP_POR_NIVEL) + 1;

export const dificuldade = (taxaErro) => (taxaErro >= 30 ? "Alta" : taxaErro >= 20 ? "Média" : "Baixa");
