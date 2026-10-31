import Tarefa from "../models/Tarefa.js";

class tarefaService {
    async Create(id_fono, id_paciente, tipo, titulo, palavras) {
        const nova = new Tarefa({ id_fono, id_paciente, tipo, titulo, palavras });
        return await nova.save();
    }

    async getAllDaFono(id_fono, id_paciente, apenasPendentes) {
        const filtro = { id_fono };
        if (id_paciente) filtro.id_paciente = id_paciente;
        if (apenasPendentes) filtro.concluida_em = null;
        return await Tarefa.find(filtro).sort({ createdAt: -1 });
    }

    async getNoPeriodo(id_fono, id_paciente, inicio, fim) {
        const filtro = {
            id_fono,
            $or: [
                { createdAt: { $gte: inicio, $lt: fim } },
                { concluida_em: { $gte: inicio, $lt: fim } }
            ]
        };
        if (id_paciente) filtro.id_paciente = id_paciente;
        return await Tarefa.find(filtro);
    }

    async getPendentesDoPaciente(id_paciente) {
        return await Tarefa.find({ id_paciente, concluida_em: null }).sort({ createdAt: 1 });
    }

    async getOne(id) {
        return await Tarefa.findById(id);
    }

    async delete(id) {
        await Tarefa.findByIdAndDelete(id);
    }

    async concluir(id) {
        return await Tarefa.findOneAndUpdate(
            { _id: id, concluida_em: null },
            { concluida_em: new Date() },
            { returnDocument: "after" }
        );
    }
};

export default new tarefaService();