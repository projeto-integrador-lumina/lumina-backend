import notificacaoService from "../services/notificacaoService.js";

const getNotificacoes = async (req, res) => {
    try {
        const notificacoes = await notificacaoService.getAll(req.loggedUser.idPaciente);
        res.status(200).json({notificacoes});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar notificações."});
    }
};

const marcarLidas = async (req, res) => {
    try {
        await notificacaoService.marcarLidas(req.loggedUser.idPaciente);
        res.status(200).json({message: "Notificações marcadas como lidas."});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao marcar notificações."});
    }
};

const limparNotificacoes = async (req, res) => {
    try {
        await notificacaoService.limpar(req.loggedUser.idPaciente);
        res.status(200).json({message: "Notificações removidas."});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao limpar notificações."});
    }
};

export default { getNotificacoes, marcarLidas, limparNotificacoes };
