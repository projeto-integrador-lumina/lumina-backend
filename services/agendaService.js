import tarefaService from "./tarefaService.js";
import tentativaService from "./tentativaService.js";
import { diaLocal } from "../utils/data.js";

const minutos = (ms) => Math.round((ms / 60000) * 10) / 10;

class agendaService {
    async eventos(id_fono, pacientes, periodo, id_paciente) {
        const nomes = new Map(pacientes.map((p) => [String(p._id), `${p.nome} ${p.sobrenome}`]));
        const ids = pacientes.map((p) => p._id);

        const atividades = (await tarefaService.getNoPeriodo(id_fono, id_paciente, periodo.inicio, periodo.fim))
            .filter((a) => nomes.has(String(a.id_paciente)));
        const tentativas = await tentativaService.getPorPeriodo(ids, periodo.inicio, periodo.fim);

        const eventos = [];
        const dentro = (d) => d && d >= periodo.inicio && d < periodo.fim;

        for (const a of atividades) {
            const base = {
                id_paciente: a.id_paciente,
                paciente: nomes.get(String(a.id_paciente)),
                id_tarefa: a._id,
                titulo: a.titulo,
                tipo_tarefa: a.tipo
            };
            if (dentro(a.createdAt)) eventos.push({ ...base, data: diaLocal(a.createdAt), tipo: "tarefa_atribuida" });
            if (dentro(a.concluida_em)) eventos.push({ ...base, data: diaLocal(a.concluida_em), tipo: "tarefa_concluida" });
        }

        const treinos = new Map();
        for (const t of tentativas) {
            const data = diaLocal(t.createdAt);
            const chave = data + "|" + t.id_paciente;
            if (!treinos.has(chave)) {
                treinos.set(chave, { data, tipo: "treino", id_paciente: t.id_paciente, paciente: nomes.get(String(t.id_paciente)), tentativas: 0, ms: 0 });
            }
            const x = treinos.get(chave);
            x.tentativas++;
            x.ms += t.duracao_ms || 0;
        }
        for (const { ms, ...resto } of treinos.values()) eventos.push({ ...resto, minutos: minutos(ms) });

        return eventos.sort((a, b) => a.data.localeCompare(b.data));
    }
};

export default new agendaService();