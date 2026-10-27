import express from "express";
const appRoutes = express.Router();
import appController from "../controllers/appController.js";
import lojaController from "../controllers/lojaController.js";
import notificacaoController from "../controllers/notificacaoController.js";
import mensagemController from "../controllers/mensagemController.js";
import Auth, { soPaciente } from "../middlewares/Auth.js";
import AuthResponsavel from "../middlewares/AuthResponsavel.js";

// Rotas do PWA: só pacientes. O paciente vem do token, nunca da URL.
const paciente = [Auth, soPaciente];

appRoutes.get('/app/home', paciente, appController.getHome);
appRoutes.get('/app/perfil', paciente, appController.getPerfil);
appRoutes.get('/app/perfil/evolucao', paciente, appController.getEvolucao);

appRoutes.get('/app/niveis', paciente, appController.getNiveis);
appRoutes.get('/app/niveis/:numero', paciente, appController.getNivel);
appRoutes.get('/app/palavras/:id/opcoes', paciente, appController.getOpcoes);
appRoutes.post('/app/tentativas', paciente, appController.createTentativa);

appRoutes.get('/app/missoes', paciente, appController.getMissoes);
appRoutes.get('/app/missoes/:id', paciente, appController.getMissao);
appRoutes.post('/app/missoes/:id/concluir', paciente, appController.concluirMissao);

appRoutes.get('/app/loja', paciente, lojaController.getLoja);
appRoutes.post('/app/loja/comprar', paciente, lojaController.comprarItem);
appRoutes.get('/app/inventario', paciente, lojaController.getInventario);
appRoutes.put('/app/avatar', paciente, lojaController.updateAvatar);

appRoutes.get('/app/notificacoes', paciente, notificacaoController.getNotificacoes);
appRoutes.post('/app/notificacoes/lidas', paciente, notificacaoController.marcarLidas);
appRoutes.post('/app/notificacoes/limpar', paciente, notificacaoController.limparNotificacoes);

// mensagens: além do login, exigem o PIN do responsável (token curto no header X-Responsavel-Token)
appRoutes.post('/app/mensagens/desbloquear', paciente, mensagemController.desbloquearMensagens);
appRoutes.get('/app/mensagens', paciente, AuthResponsavel, mensagemController.getMensagensApp);
appRoutes.post('/app/mensagens', paciente, AuthResponsavel, mensagemController.createMensagemApp);

appRoutes.get('/app/configuracoes', paciente, appController.getConfiguracoes);
appRoutes.put('/app/configuracoes', paciente, appController.updateConfiguracoes);

export default appRoutes;
