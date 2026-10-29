import pacienteService from "./pacienteService.js";
import atividadeService from "./atividadeService.js";
import tentativaService from "./tentativaService.js";
import notificacaoService from "./notificacaoService.js";
import mensagemService from "./mensagemService.js";
import nivelService from "./nivelService.js";
import palavraService from "./palavraService.js";
import { diaLocal, hojeLocal, somaDias, nomeDoDia, segundaDaSemana, inicioDoDia } from "../utils/data.js";
import {
    CATEGORIAS, ROTULOS, XP_POR_ACERTO, MOEDAS_PRIMEIRO_ACERTO, XP_POR_NIVEL, nivelDoJogador
} from "../utils/jogo.js";

const resumoAtividade = (a) => a ? { _id: a._id, titulo: a.titulo, total_palavras: a.palavras.length } : null;

class appService {
    async home(paciente) {
        const hoje = hojeLocal();
        const segunda = segundaDaSemana(hoje);
        const tentativas = await tentativaService.getDesde(paciente._id, inicioDoDia(somaDias(hoje, -59)));
        const dias = new Set(tentativas.map((t) => diaLocal(t.createdAt)));

        let sequencia = 0;
        let cursor = dias.has(hoje) ? hoje : somaDias(hoje, -1);
        while (dias.has(cursor)) {
            sequencia++;
            cursor = somaDias(cursor, -1);
        }

        const semana = Array.from({ length: 7 }, (_, i) => {
            const data = somaDias(segunda, i);
            return { dia: nomeDoDia(data), data, treinou: dias.has(data), hoje: data === hoje };
        });

        const [notificacoes, mensagens, pendentes] = await Promise.all([
            notificacaoService.contarNaoLidas(paciente._id),
            mensagemService.contarNaoLidas(paciente._id, "fono"),
            atividadeService.getPendentesDoPaciente(paciente._id)
        ]);

        return {
            nome: paciente.nome,
            nivel: nivelDoJogador(paciente.xp),
            xp_no_nivel: paciente.xp % XP_POR_NIVEL,
            xp_por_nivel: XP_POR_NIVEL,
            moedas: paciente.moedas,
            notificacoes_nao_lidas: notificacoes,
            mensagens_nao_lidas: mensagens,
            sequencia,
            semana,
            treino: resumoAtividade(pendentes.find((a) => a.tipo === "treino")),
            missao: resumoAtividade(pendentes.find((a) => a.tipo === "missao"))
        };
    }

    async progressoNiveis(id_paciente) {
        const niveis = await nivelService.getAll();
        const acertadas = new Set((await tentativaService.palavrasAcertadas(id_paciente)).map(String));

        let anteriorConcluido = true;
        return niveis.map((n) => {
            const total = n.palavras.length;
            const feitas = n.palavras.filter((p) => acertadas.has(String(p))).length;
            const concluido = total > 0 && feitas === total;
            const item = {
                numero: n.numero,
                nome: n.nome,
                total_palavras: total,
                palavras_acertadas: feitas,
                estrelas: total ? Math.floor((3 * feitas) / total) : 0,
                concluido,
                desbloqueado: anteriorConcluido
            };
            anteriorConcluido = concluido;
            return item;
        });
    }

    async registrarTentativa(paciente, palavra, dados) {
        const { tipo, acertou, silabas, id_escolhida, duracao_ms, id_atividade } = dados;
        const primeiraVez = tipo === "fala" && acertou &&
            !(await tentativaService.jaAcertou(paciente._id, palavra._id));

        await tentativaService.Create({
            id_paciente: paciente._id,
            id_palavra: palavra._id,
            id_atividade: id_atividade || null,
            tipo,
            silabas,
            id_escolhida: id_escolhida || null,
            acertou,
            duracao_ms
        });

        const xp = acertou ? XP_POR_ACERTO : 0;
        const moedas = primeiraVez ? MOEDAS_PRIMEIRO_ACERTO : 0;

        const nivelAntes = nivelDoJogador(paciente.xp); 

        let atual = paciente;
        if (xp || moedas) atual = await pacienteService.addGanhos(paciente._id, xp, moedas);

        const nivelDepois = nivelDoJogador(atual.xp);
        const subiuDeNivel = nivelDepois > nivelAntes;
        if (subiuDeNivel) {
            await notificacaoService.Create(
                paciente._id, "nivel", `Subimos de nível! Você agora está no nível ${nivelDepois}. Continue assim!`
            );
        }

        return {
            tipo,
            acertou,
            silabas,
            ganhos: { xp, moedas },
            nivel: nivelDepois,
            subiu_de_nivel: subiuDeNivel,
            xp_no_nivel: atual.xp % XP_POR_NIVEL,
            moedas_total: atual.moedas
        };
    }

    async evolucaoPorCategoria(id_paciente) {
        const tentativas = await tentativaService.getDoPaciente(id_paciente);
        const ids = [...new Set(tentativas.map((t) => String(t.id_palavra)))];
        const palavras = await palavraService.getByIds(ids);
        const categoriaDe = new Map(palavras.map((p) => [String(p._id), p.categoria_som]));

        return CATEGORIAS.map((categoria) => {
            const daCategoria = tentativas.filter((t) => categoriaDe.get(String(t.id_palavra)) === categoria);
            const acertos = daCategoria.filter((t) => t.acertou).length;
            return {
                categoria,
                rotulo: ROTULOS[categoria],
                tentativas: daCategoria.length,
                acertos,
                percentual: daCategoria.length ? Math.round((acertos / daCategoria.length) * 100) : 0
            };
        });
    }
};

export default new appService();
