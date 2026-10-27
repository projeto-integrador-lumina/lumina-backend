import pacienteService from "../services/pacienteService.js";

// só aceita string com 24 caracteres hexadecimais (nada de número ou objeto vindo do body)
export const idValido = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

// Devolve { paciente } se o paciente existe, está ativo e é DESTA fono;
// senão { status, error } para o controller responder.
export const pacienteDaFono = async (id, idFono) => {
    if (!idValido(id)) return { status: 400, error: "ID de paciente inválido." };

    const paciente = await pacienteService.getOne(id);
    if (!paciente || !paciente.ativo) return { status: 404, error: "Paciente não encontrado." };
    if (paciente.id_fono.toString() !== idFono) {
        return { status: 403, error: "Você não tem permissão para acessar este paciente." };
    }
    return { paciente };
};
