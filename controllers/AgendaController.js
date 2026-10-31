import agendaService from "../services/agendaService.js";
import pacienteService from "../services/pacienteService.js";
import { pacienteDaFono } from "../utils/acesso.js";
import { lerPeriodo } from "../utils/data.js";

const getAgenda = async (req, res) => {
    try {
        const periodo = lerPeriodo(req.query);
        if (periodo.erro) return res.status(400).json({error: periodo.erro});

        const idFono = req.loggedUser.idFono;
        const { id_paciente } = req.query;
        let pacientes = await pacienteService.getAll(idFono);

        if (id_paciente) {
            const acesso = await pacienteDaFono(id_paciente, idFono);
            if (acesso.error) return res.status(acesso.status).json({error: acesso.error});
            pacientes = pacientes.filter((p) => String(p._id) === String(acesso.paciente._id));
        }

        const eventos = await agendaService.eventos(idFono, pacientes, periodo, id_paciente);
        res.status(200).json({periodo: {de: periodo.de, ate: periodo.ate}, eventos});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar agenda."});
    }
};

export default { getAgenda };