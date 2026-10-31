import pacienteService from "./pacienteService.js";
import tentativaService from "./tentativaService.js";
import palavraService from "./palavraService.js";
import { diaLocal, hojeLocal, somaDias, nomeDoDia, segundaDaSemana, inicioDoDia } from "../utils/data.js";
import { CATEGORIAS, ROTULOS, dificuldade } from "../utils/jogo.js";

const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);
const minutos = (ms) => Math.round((ms / 60000) * 10) / 10;

const mapaDePalavras = async (tentativas) => {
    const ids = [...new Set(tentativas.map((t) => String(t.id_palavra)))];
    const palavras = await palavraService.getByIds(ids);
    return new Map(palavras.map((p) => [String(p._id), p]));
};

class relatorioService {
    async pacientesDaFono(id_fono) {
        return await pacienteService.getAll(id_fono);
    }

    async totalCadastrados(id_fono) {
        return (await pacienteService.getAll(id_fono, null)).length;
    }

    async resumo(pacientes, periodo, totalCadastrados) {
        const ids = pacientes.map((p) => p._id);
        const hoje = hojeLocal();
        const fim = inicioDoDia(somaDias(hoje, 1));
        const qtd = Math.max(pacientes.length, 1);

        const ultimos7 = await tentativaService.getPorPeriodo(ids, inicioDoDia(somaDias(hoje, -6)), fim);
        const doPeriodo = await tentativaService.getPorPeriodo(ids, periodo.inicio, periodo.fim);

        const dia = (data) => {
            const doDia = ultimos7.filter((t) => diaLocal(t.createdAt) === data);
            const min = minutos(doDia.reduce((s, t) => s + (t.duracao_ms || 0), 0));
            return {
                data,
                dia: nomeDoDia(data),
                tentativas: doDia.length,
                minutos: min,                                   
                minutos_media: Math.round((min / qtd) * 10) / 10 
            };
        };

        const por_dia = Array.from({ length: 7 }, (_, i) => dia(somaDias(hoje, i - 6)));

        const segunda = segundaDaSemana(hoje);
        const semana_atual = Array.from({ length: 7 }, (_, i) => dia(somaDias(segunda, i)));

        const treinouNaSemana = new Set(ultimos7.map((t) => String(t.id_paciente)));

        const ultimoTreino = new Map();
        for (const t of doPeriodo) {
            const chave = String(t.id_paciente);
            if (!ultimoTreino.has(chave) || t.createdAt > ultimoTreino.get(chave)) ultimoTreino.set(chave, t.createdAt);
        }

        const inativos = pacientes
            .filter((p) => !treinouNaSemana.has(String(p._id)))
            .map((p) => ({
                _id: p._id,
                nome: `${p.nome} ${p.sobrenome}`,
                foto_perfil: p.foto_perfil || null,
                ultimo_treino: ultimoTreino.get(String(p._id)) || null
            }));

        const top_pacientes = pacientes
            .map((p) => {
                const t = doPeriodo.filter((x) => String(x.id_paciente) === String(p._id));
                const acertos = t.filter((x) => x.acertou).length;
                return {
                    _id: p._id,
                    nome: `${p.nome} ${p.sobrenome}`,
                    foto_perfil: p.foto_perfil || null,
                    tentativas: t.length,
                    acertos,
                    taxa_acerto: pct(acertos, t.length),
                    minutos: minutos(t.reduce((s, x) => s + (x.duracao_ms || 0), 0))
                };
            })
            .filter((p) => p.tentativas > 0)
            .sort((a, b) => b.minutos - a.minutos || b.tentativas - a.tentativas)
            .slice(0, 5);

        const acertosTotal = doPeriodo.filter((t) => t.acertou).length;

        const pares = new Set(doPeriodo.map((t) => diaLocal(t.createdAt) + "|" + t.id_paciente));
        const msTotal = doPeriodo.reduce((s, t) => s + (t.duracao_ms || 0), 0);

        return {
            periodo: { de: periodo.de, ate: periodo.ate },
            total_cadastrados: totalCadastrados ?? pacientes.length,
            pacientes_ativos: pacientes.length,
            media_acertos: pct(acertosTotal, doPeriodo.length),
            tempo_medio_min: pares.size ? minutos(msTotal / pares.size) : 0,
            por_dia,
            semana_atual,
            inativos,
            top_pacientes
        };
    }
    async ranking(pacientes, periodo) {
        const tentativas = await tentativaService.getPorPeriodo(pacientes.map((p) => p._id), periodo.inicio, periodo.fim);

        const lista = pacientes
            .map((p) => {
                const t = tentativas.filter((x) => String(x.id_paciente) === String(p._id));
                const semanas = new Map();
                for (const x of t) {
                    const inicio = segundaDaSemana(diaLocal(x.createdAt));
                    if (!semanas.has(inicio)) semanas.set(inicio, { semana: inicio, tentativas: 0, acertos: 0 });
                    const w = semanas.get(inicio);
                    w.tentativas++;
                    if (x.acertou) w.acertos++;
                }
                const por_semana = [...semanas.values()]
                    .sort((a, b) => a.semana.localeCompare(b.semana))
                    .map((w) => ({ ...w, taxa_acerto: pct(w.acertos, w.tentativas) }));

                const primeira = por_semana[0];
                const ultima = por_semana[por_semana.length - 1];
                const temEvolucao = por_semana.length >= 2;

                return {
                    _id: p._id,
                    nome: `${p.nome} ${p.sobrenome}`,
                    foto_perfil: p.foto_perfil || null,
                    tentativas: t.length,
                    minutos: minutos(t.reduce((s, x) => s + (x.duracao_ms || 0), 0)),
                    taxa_inicial: primeira ? primeira.taxa_acerto : null,
                    taxa_atual: ultima ? ultima.taxa_acerto : null,
                    evolucao: temEvolucao ? ultima.taxa_acerto - primeira.taxa_acerto : null,
                    por_semana
                };
            })
            .filter((p) => p.tentativas > 0)
            .sort((a, b) => b.tentativas - a.tentativas);

        const { por_semana, ...maior } = [...lista]
            .filter((p) => p.evolucao !== null)
            .sort((a, b) => b.evolucao - a.evolucao)[0] || {};

        return {
            periodo: { de: periodo.de, ate: periodo.ate },
            maior_evolucao: maior._id ? maior : null,
            pacientes: lista
        };
    }

    async porFonema(ids_pacientes, periodo) {
        const tentativas = await tentativaService.getPorPeriodo(ids_pacientes, periodo.inicio, periodo.fim);
        const palavras = await mapaDePalavras(tentativas);

        const grupos = new Map();
        for (const t of tentativas) {
            const fonema = palavras.get(String(t.id_palavra))?.fonema || "Sem fonema";
            if (!grupos.has(fonema)) grupos.set(fonema, { fonema, acertos: 0, erros: 0 });
            grupos.get(fonema)[t.acertou ? "acertos" : "erros"]++;
        }

        return [...grupos.values()]
            .map((g) => {
                const total = g.acertos + g.erros;
                const taxa_erro = pct(g.erros, total);
                return { ...g, tentativas: total, taxa_acerto: pct(g.acertos, total), taxa_erro, dificuldade: dificuldade(taxa_erro) };
            })
            .sort((a, b) => b.taxa_erro - a.taxa_erro);
    }

    async porAtividade(pacientes, periodo) {
        const nomes = new Map(pacientes.map((p) => [String(p._id), `${p.nome} ${p.sobrenome}`]));
        const tentativas = await tentativaService.getPorPeriodo(pacientes.map((p) => p._id), periodo.inicio, periodo.fim);

        const linhas = new Map();
        for (const t of tentativas) {
            const data = diaLocal(t.createdAt);
            const chave = data + "|" + t.id_paciente;
            if (!linhas.has(chave)) {
                linhas.set(chave, { data, id_paciente: t.id_paciente, paciente: nomes.get(String(t.id_paciente)), ms: 0, tentativas: 0 });
            }
            const l = linhas.get(chave);
            l.ms += t.duracao_ms || 0;
            l.tentativas++;
        }

        const dias = [...linhas.values()]
            .sort((a, b) => a.data.localeCompare(b.data))
            .map(({ ms, ...resto }) => ({ ...resto, minutos: minutos(ms) }));

        return { dias, total_minutos: Math.round(dias.reduce((s, d) => s + d.minutos, 0) * 10) / 10 };
    }

    async evolucao(id_paciente, periodo) {
        const tentativas = await tentativaService.getPorPeriodo([id_paciente], periodo.inicio, periodo.fim);
        const palavras = await mapaDePalavras(tentativas);

        const por_categoria = CATEGORIAS.map((categoria) => {
            const t = tentativas.filter((x) => palavras.get(String(x.id_palavra))?.categoria_som === categoria);
            const acertos = t.filter((x) => x.acertou).length;
            return { categoria, rotulo: ROTULOS[categoria], tentativas: t.length, acertos, taxa_acerto: pct(acertos, t.length) };
        });

        const semanas = new Map();
        for (const t of tentativas) {
            const inicio = segundaDaSemana(diaLocal(t.createdAt));
            if (!semanas.has(inicio)) semanas.set(inicio, { semana: inicio, tentativas: 0, acertos: 0 });
            const s = semanas.get(inicio);
            s.tentativas++;
            if (t.acertou) s.acertos++;
        }
        const por_semana = [...semanas.values()]
            .sort((a, b) => a.semana.localeCompare(b.semana))
            .map((s) => ({ ...s, taxa_acerto: pct(s.acertos, s.tentativas) }));

        return { periodo: { de: periodo.de, ate: periodo.ate }, por_categoria, por_semana };
    }
};

export default new relatorioService();