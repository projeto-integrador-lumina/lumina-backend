// Regras do jogo num lugar só: para mudar a pontuação, mexa aqui.
export const CATEGORIAS = ["liquido", "explosivo", "nasal", "fricativo"];

export const ROTULOS = {
    liquido: "Sons líquidos",
    explosivo: "Sons explosivos",
    nasal: "Sons nasais",
    fricativo: "Sons fricativos"
};

export const XP_POR_ACERTO = 10;          // todo acerto dá xp
export const MOEDAS_PRIMEIRO_ACERTO = 5;  // moedas só no 1º acerto de cada palavra (evita "fazenda" de moedas)
export const XP_POR_NIVEL = 100;
export const MOEDAS_MISSAO = 20;
export const MOEDAS_TREINO = 10;

export const nivelDoJogador = (xp) => Math.floor(xp / XP_POR_NIVEL) + 1;

// taxa de erro em % -> dificuldade mostrada no relatório da fono
export const dificuldade = (taxaErro) => (taxaErro >= 30 ? "Alta" : taxaErro >= 20 ? "Média" : "Baixa");
