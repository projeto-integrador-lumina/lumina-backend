# Lumina — Backend

Serviços de API RESTful, regras de negócio e infraestrutura de persistência de dados do ecossistema Lumina / Lolá: Gamificando a Fala.

---

## Objetivo do Repositório

Alojar e gerir a camada servidora responsável por processar as regras clínicas, gerir a segurança de acesso da equipa de fonoaudiologia, disponibilizar endpoints para o painel administrativo e registar o histórico detalhado de partidas e desempenho fonológico gerado pelo PWA infantil.

---

## Principais Responsabilidades e Módulos

* **Autenticação e Autorização:**
  * Registo e login de fonoaudiólogos com encriptação de palavras-passe via bcrypt.
  * Emissão e validação de tokens JWT para proteção das rotas administrativas.
* **Gestão Clínica de Pacientes:**
  * Operações CRUD completas (criação, listagem paginada, atualização e remoção) dos registos de crianças.
  * Associação de dados clínicos, nível de desvio fonológico e observações terapêuticas.
* **Métricas e Relatórios Analíticos:**
  * Agregação estatística de sessões por dia da semana para o painel da Home.
  * Cálculo de taxas de erro e acerto segmentadas por fonema para apoiar o diagnóstico.
* **Serviços do Jogo Gamificado:**
  * Identificação de sessão do paciente mirim.
  * Persistência dos itens de personalização do avatar e saldo de moedas conquistadas.
  * Registo e consolidação dos resultados de tentativas de fala enviadas pelas fases do jogo.

---

## Tecnologias Utilizadas

* **Node.js:** Ambiente de execução assíncrono para o ecossistema JavaScript de backend.
* **Express.js (ou framework HTTP equivalente):** Roteamento, criação de middlewares e controladores REST.
* **Bcrypt:** Algoritmo seguro para dispersão e encriptação de credenciais.
* **JSON Web Token (JWT):** Gestão de sessões sem estado e proteção de endpoints.
* **Base de Dados (Relacional ou NoSQL):** Modelação e armazenamento das entidades de utilizadores, pacientes, itens do avatar e histórico de sessões.


├── package.json        # Dependências e scripts do Node.js
└── server.js           # Ficheiro principal de arranque da aplicação
