import pacienteService from "../services/pacienteService.js";

export const idValido = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

export const pacienteDaFono = async (id, idFono) => {
    if (!idValido(id)) return { status: 400, error: "ID de paciente inválido." };

    const paciente = await pacienteService.getOne(id);
    if (!paciente || !paciente.ativo) return { status: 404, error: "Paciente não encontrado." };
    if (paciente.id_fono.toString() !== idFono) {
        return { status: 403, error: "Você não tem permissão para acessar este paciente." };
    }
    return { paciente };
};
