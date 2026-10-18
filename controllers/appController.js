import appService from "../services/appService.js";
import pacienteService from "../services/pacienteService.js";
import palavraService from "../services/palavraService.js";
import nivelService from "../services/nivelService.js";
import atividadeService from "../services/atividadeService.js";
import tentativaService from "../services/tentativaService.js";
import { idValido } from "../utils/acesso.js";
import { idade } from "../utils/data.js";
import { MOEDAS_MISSAO, MOEDAS_TREINO } from "../utils/jogo.js";

// o paciente logado (o id vem do TOKEN, nunca da URL)
const pacienteLogado = (req) => pacienteService.getOne(req.loggedUser.idPaciente);

// formato de palavra enviado ao exercício (sem dados clínicos como fonema/categoria)
const paraExercicio = (palavra, acertadas) => ({
    _id: palavra._id,
    texto: palavra.texto,
    silabas: palavra.silabas,
    imagem_url: palavra.imagem_url,
    audio_url: palavra.audio_url,
    acertada: acertadas.has(String(palavra._id))
});

const getHome = async (req, res) => {
    try {
        const paciente = await pacienteLogado(req);
        res.status(200).json(await appService.home(paciente));
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao carregar a home."});
    }
};

const getPerfil = async (req, res) => {
    try {
        const p = await pacienteLogado(req);
        res.status(200).json({
            nome: p.nome,
            sobrenome: p.sobrenome,
            data_nasc: p.data_nasc,
            idade: idade(p.data_nasc),
            alvo_atual: p.alvo_atual || null,
            foto_perfil: p.foto_perfil || null
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar perfil."});
    }
};

const getEvolucao = async (req, res) => {
    try {
        res.status(200).json({categorias: await appService.evolucaoPorCategoria(req.loggedUser.idPaciente)});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar evolução."});
    }
};

/* ----------------------------- níveis ----------------------------- */

const getNiveis = async (req, res) => {
    try {
        res.status(200).json({niveis: await appService.progressoNiveis(req.loggedUser.idPaciente)});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar níveis."});
    }
};

const getNivel = async (req, res) => {
    try {
        const numero = Number(req.params.numero);
        if (!Number.isInteger(numero) || numero < 1) {
            return res.status(400).json({error: "Número de nível inválido."});
        }

        const nivel = await nivelService.getByNumero(numero);
        if (!nivel) return res.status(404).json({error: "Nível não encontrado."});

        const progresso = await appService.progressoNiveis(req.loggedUser.idPaciente);
        if (!progresso.find((n) => n.numero === numero)?.desbloqueado) {
            return res.status(403).json({error: "Esse nível ainda está bloqueado. Conclua o anterior!"});
        }

        const acertadas = new Set((await tentativaService.palavrasAcertadas(req.loggedUser.idPaciente)).map(String));
        const palavras = await palavraService.getByIds(nivel.palavras);
        // mantém a ordem definida no nível
        const porId = new Map(palavras.map((p) => [String(p._id), p]));
        const ordenadas = nivel.palavras.map((id) => porId.get(String(id))).filter(Boolean);

        res.status(200).json({
            nivel: { numero: nivel.numero, nome: nivel.nome },
            palavras: ordenadas.map((p) => paraExercicio(p, acertadas))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar nível."});
    }
};

/* ---------------------------- tentativas ---------------------------- */

// body: { id_palavra, silabas: [{ acertou: true|false }, ...], duracao_ms, id_atividade? }
// Obs.: o app informa se cada sílaba foi acertada; o servidor calcula "acertou" e as recompensas.
const createTentativa = async (req, res) => {
    try {
        const { id_palavra, silabas, duracao_ms, id_atividade } = req.body;

        if (!idValido(id_palavra)) return res.status(400).json({error: "id_palavra inválido."});
        if (!Array.isArray(silabas) || !silabas.every((s) => s && typeof s.acertou === "boolean")) {
            return res.status(400).json({error: "Envie silabas: [{ acertou: true|false }, ...]."});
        }
        if (duracao_ms !== undefined && (!Number.isFinite(duracao_ms) || duracao_ms < 0)) {
            return res.status(400).json({error: "duracao_ms inválida."});
        }

        const palavra = await palavraService.getOne(id_palavra);
        if (!palavra) return res.status(404).json({error: "Palavra não encontrada."});
        if (silabas.length !== palavra.silabas.length) {
            return res.status(400).json({error: `Essa palavra tem ${palavra.silabas.length} sílaba(s).`});
        }

        if (id_atividade !== undefined && id_atividade !== null) {
            if (!idValido(id_atividade)) return res.status(400).json({error: "id_atividade inválido."});
            const atividade = await atividadeService.getOne(id_atividade);
            const valida = atividade &&
                atividade.id_paciente.toString() === req.loggedUser.idPaciente &&
                !atividade.concluida_em &&
                atividade.palavras.some((p) => String(p) === String(palavra._id));
            if (!valida) return res.status(400).json({error: "Essa palavra não faz parte dessa atividade."});
        }

        const paciente = await pacienteLogado(req);
        const resultado = await appService.registrarTentativa(
            paciente, palavra, silabas.map((s) => s.acertou),
            Math.min(Math.round(duracao_ms || 0), 10 * 60 * 1000), // no máximo 10 min por tentativa
            id_atividade
        );
        res.status(201).json(resultado);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao registrar tentativa."});
    }
};

/* ---------------------------- atividades ---------------------------- */

const getAtividades = async (req, res) => {
    try {
        const pendentes = await atividadeService.getPendentesDoPaciente(req.loggedUser.idPaciente);
        res.status(200).json({
            atividades: pendentes.map((a) => ({
                _id: a._id, tipo: a.tipo, titulo: a.titulo, total_palavras: a.palavras.length, createdAt: a.createdAt
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar atividades."});
    }
};

// carrega a atividade e confere se é DESTE paciente
const atividadeDoPaciente = async (req, res) => {
    if (!idValido(req.params.id)) {
        res.status(400).json({error: "ID inválido."});
        return null;
    }
    const atividade = await atividadeService.getOne(req.params.id);
    if (!atividade || atividade.id_paciente.toString() !== req.loggedUser.idPaciente) {
        res.status(404).json({error: "Atividade não encontrada."});
        return null;
    }
    return atividade;
};

const getAtividade = async (req, res) => {
    try {
        const atividade = await atividadeDoPaciente(req, res);
        if (!atividade) return;

        const acertadas = new Set((await tentativaService.palavrasAcertadasDesde(
            req.loggedUser.idPaciente, atividade.palavras, atividade.createdAt
        )).map(String));
        const palavras = await palavraService.getByIds(atividade.palavras);
        const porId = new Map(palavras.map((p) => [String(p._id), p]));

        res.status(200).json({
            atividade: { _id: atividade._id, tipo: atividade.tipo, titulo: atividade.titulo, concluida_em: atividade.concluida_em },
            palavras: atividade.palavras.map((id) => porId.get(String(id))).filter(Boolean).map((p) => paraExercicio(p, acertadas))
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar atividade."});
    }
};

// só conclui se TODAS as palavras foram acertadas depois que a fono atribuiu
const concluirAtividade = async (req, res) => {
    try {
        const atividade = await atividadeDoPaciente(req, res);
        if (!atividade) return;
        if (atividade.concluida_em) return res.status(409).json({error: "Essa atividade já foi concluída."});

        const acertadas = new Set((await tentativaService.palavrasAcertadasDesde(
            req.loggedUser.idPaciente, atividade.palavras, atividade.createdAt
        )).map(String));
        const faltam = atividade.palavras.filter((p) => !acertadas.has(String(p)));
        if (faltam.length) {
            return res.status(409).json({error: "Ainda faltam palavras para concluir.", faltam});
        }

        // atômico: se dois pedidos chegarem juntos, só um recebe a recompensa
        const concluida = await atividadeService.concluir(atividade._id);
        if (!concluida) return res.status(409).json({error: "Essa atividade já foi concluída."});

        const moedas = atividade.tipo === "missao" ? MOEDAS_MISSAO : MOEDAS_TREINO;
        const atual = await pacienteService.addGanhos(req.loggedUser.idPaciente, 0, moedas);
        res.status(200).json({message: "Atividade concluída!", moedas_ganhas: moedas, moedas_total: atual.moedas});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao concluir atividade."});
    }
};

/* --------------------------- configurações --------------------------- */

const CONFIG = {
    som_ligado: (v) => typeof v === "boolean",
    volume: (v) => Number.isFinite(v) && v >= 0 && v <= 100,
    narracao: (v) => typeof v === "boolean",
    alto_contraste: (v) => typeof v === "boolean"
};

const getConfiguracoes = async (req, res) => {
    try {
        const p = await pacienteLogado(req);
        res.status(200).json({configuracoes: p.preferencias});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar configurações."});
    }
};

const updateConfiguracoes = async (req, res) => {
    try {
        const campos = {};
        for (const [chave, valido] of Object.entries(CONFIG)) {
            if (req.body[chave] === undefined) continue;
            if (!valido(req.body[chave])) return res.status(400).json({error: `Valor inválido para "${chave}".`});
            campos["preferencias." + chave] = req.body[chave];
        }
        if (!Object.keys(campos).length) return res.status(400).json({error: "Nenhuma configuração enviada."});

        const p = await pacienteService.setCampos(req.loggedUser.idPaciente, campos);
        res.status(200).json({message: "Configurações salvas!", configuracoes: p.preferencias});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao salvar configurações."});
    }
};

export default {
    getHome, getPerfil, getEvolucao, getNiveis, getNivel, createTentativa,
    getAtividades, getAtividade, concluirAtividade, getConfiguracoes, updateConfiguracoes
};