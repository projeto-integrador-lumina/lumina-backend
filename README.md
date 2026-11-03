# Lumina Backend — API do Sistema Lumina

O **Lumina Backend** é a API responsável pelo gerenciamento dos dados, autenticação, regras de negócio e integração entre as aplicações do ecossistema **Lumina — Gamificando a Fala**.

O projeto foi desenvolvido como parte do Projeto Integrador do curso de **Desenvolvimento de Software Multiplataforma da Fatec Registro**, com o objetivo de apoiar o acompanhamento fonoaudiológico de crianças com desvio fonológico.

A API atende a duas aplicações:

- **Lumina Dashboard:** painel web utilizado pelos fonoaudiólogos para gerenciar pacientes, atividades, relatórios e outras informações.
- **Lolá:** aplicação web infantil destinada aos pacientes, com atividades lúdicas e elementos de gamificação.

As duas aplicações utilizam o mesmo backend e o mesmo banco de dados MongoDB Atlas.

## Aplicações do ecossistema

| Aplicação | Endereço |
|---|---|
| Lumina Dashboard | https://lumina-frontend-dashboard-seven.vercel.app |
| Lolá | https://my-app-orpin-phi-25.vercel.app/ |
| Lumina Backend | https://lumina-backend-6mk6.onrender.com |

O backend está hospedado no Render, enquanto os frontends estão hospedados na Vercel.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução JavaScript |
| Express 5 | Framework utilizado para construir a API |
| MongoDB Atlas | Banco de dados não relacional hospedado na nuvem |
| Mongoose 9 | Modelagem e manipulação dos documentos MongoDB |
| JSON Web Token (JWT) | Autenticação e controle de acesso |
| Bcrypt | Geração e verificação de hashes de senhas |
| Dotenv | Carregamento das variáveis de ambiente |
| Multer | Processamento de uploads |
| JavaScript ES Modules | Organização dos módulos do projeto |
| npm | Gerenciamento de dependências e execução de scripts |

O projeto também declara dependências como `cors`, `mongodb`, `swagger-ui-express`, `yaml` e `nodemon`.

A presença dessas dependências não significa que todas estejam diretamente configuradas no arquivo principal da API.

## Arquitetura do sistema

O Lumina utiliza uma arquitetura com dois frontends independentes e um backend compartilhado.

```text
             Lumina Dashboard
               (Next.js)
                   |
                   |
                   v
             Lumina Backend
             (Node.js/Express)
                   |
                   v
              MongoDB Atlas
                   ^
                   |
                   |
                 Lolá
               (Next.js)
```

O backend é responsável por receber as requisições HTTP, validar a autenticação, aplicar regras de negócio e realizar operações no banco de dados.

Essa arquitetura evita a duplicação de serviços e centraliza as informações utilizadas pelas duas aplicações.

## Estrutura do projeto

```text
lumina-backend/
│
├── config/
│   └── db-connection.js
│
├── controllers/
│   ├── AgendaController.js
│   ├── AppController.js
│   ├── AtividadeController.js
│   ├── FonoaudiologoController.js
│   ├── LojaController.js
│   ├── MensagemController.js
│   ├── NotaClinicaController.js
│   ├── NotificacaoController.js
│   ├── PacienteController.js
│   ├── RelatorioController.js
│   ├── TarefaController.js
│   └── UsuarioController.js
│
├── middlewares/
│   ├── Auth.js
│   ├── AuthResponsavel.js
│   ├── Cors.js
│   └── Upload.js
│
├── models/
├── routes/
├── scripts/
│   ├── migrar.js
│   └── seed.js
│
├── services/
├── uploads/
├── utils/
│
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

### Responsabilidade dos diretórios

| Diretório | Descrição |
|---|---|
| `config/` | Configuração da conexão com MongoDB Atlas |
| `controllers/` | Recebimento das requisições e construção das respostas HTTP |
| `middlewares/` | Autenticação, autorização, CORS e uploads |
| `models/` | Modelos de dados definidos com Mongoose |
| `routes/` | Definição dos endpoints da API |
| `scripts/` | Scripts de inicialização de dados e migração |
| `services/` | Operações de negócio e acesso aos modelos |
| `uploads/` | Arquivos enviados à aplicação |
| `utils/` | Funções auxiliares |
| `index.js` | Arquivo principal de inicialização da API |

## Pré-requisitos

Para executar o backend localmente, é necessário possuir:

- Node.js em versão compatível com as dependências do projeto.
- npm.
- Git.
- Acesso a um cluster MongoDB Atlas.
- Usuário e senha válidos para autenticação no banco.
- Uma chave secreta para assinatura dos tokens JWT.

Para verificar a instalação do Node.js e npm:

```bash
node -v
npm -v
```

## Instalação e execução local

### 1. Clonar o repositório

```bash
git clone https://github.com/projeto-integrador-lumina/lumina-backend.git
```

Acesse a pasta do projeto:

```bash
cd lumina-backend
```

### 2. Instalar as dependências

```bash
npm install
```

Esse comando instala as dependências declaradas no arquivo `package.json`.

### 3. Configurar o arquivo `.env`

O backend utiliza variáveis de ambiente para configurar a conexão com o MongoDB Atlas, autenticação JWT, porta do servidor e origens permitidas nas requisições.

**O arquivo `.env` deve ser criado manualmente na raiz do backend, no mesmo diretório de `index.js` e `package.json`.**

Exemplo:

```text
lumina-backend/
├── config/
├── controllers/
├── models/
├── routes/
├── services/
├── scripts/
├── .env
├── index.js
└── package.json
```

### Exemplo de `.env`

```env
DB_USER=seu_usuario_do_mongodb
DB_PASS=sua_senha_do_mongodb

JWTSECRET=sua_chave_secreta_longa_e_aleatoria

PORT=4000

CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://lumina-frontend-dashboard-seven.vercel.app,https://my-app-lumina-f76f.vercel.app

SEED_DEMO_REPORTS=false
```

Substitua os valores de exemplo pelas configurações do seu ambiente.

> **Atenção:** nunca utilize senhas reais ou chaves secretas em arquivos publicados no GitHub.

## Explicação das variáveis de ambiente

### `DB_USER`

```env
DB_USER=seu_usuario_do_mongodb
```

Define o nome do usuário utilizado para autenticação no MongoDB Atlas.

Esse usuário deve possuir permissão para acessar o banco utilizado pelo Lumina.

O valor deve corresponder a um usuário de banco de dados configurado no MongoDB Atlas, não ao nome de usuário de um paciente ou fonoaudiólogo.

### `DB_PASS`

```env
DB_PASS=sua_senha_do_mongodb
```

Define a senha do usuário de banco de dados informado em `DB_USER`.

O arquivo `config/db-connection.js` utiliza `DB_USER` e `DB_PASS` para montar a string de conexão com o MongoDB Atlas.

> **Importante:** a versão atual do código utiliza uma string de conexão que contém os endereços do cluster configurado para o projeto.

Portanto, não basta criar qualquer banco MongoDB e informar usuário e senha. Para utilizar outro cluster, também será necessário adaptar a string de conexão no arquivo `config/db-connection.js`.

Se a senha contiver caracteres especiais reservados em URLs, pode ser necessário codificá-los adequadamente na string de conexão.

### `JWTSECRET`

```env
JWTSECRET=sua_chave_secreta_longa_e_aleatoria
```

Define a chave secreta utilizada para assinar e verificar os tokens JWT.

Após a autenticação, o backend gera um token que permite identificar o usuário nas requisições seguintes.

Essa mesma chave é utilizada pelo middleware de autenticação para verificar a validade dos tokens.

A chave deve ser:

- Longa e aleatória.
- Mantida em segredo.
- Configurada no ambiente em que o backend é executado.
- Diferente de senhas utilizadas por usuários.

A alteração dessa chave invalida os tokens emitidos anteriormente.

**O nome correto da variável no código é `JWTSECRET`, sem sublinhado.**

### `PORT`

```env
PORT=4000
```

Define a porta utilizada pelo servidor HTTP.

No arquivo `index.js`, a porta é determinada por:

```javascript
const port = process.env.PORT || 8080;
```

Isso significa que:

- Se `PORT=4000`, a API será iniciada na porta `4000`.
- Se a variável não for definida, a API utilizará a porta `8080`.

Para manter a compatibilidade com os exemplos de execução local dos frontends, pode-se utilizar a porta `4000`.

Em serviços de hospedagem, a porta também pode ser definida automaticamente pela plataforma.

### `CORS_ORIGINS`

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://lumina-frontend-dashboard-seven.vercel.app,https://my-app-lumina-f76f.vercel.app
```

Define quais origens podem acessar a API por meio de requisições realizadas em navegadores.

O Lumina possui dois frontends hospedados na Vercel, além dos ambientes de desenvolvimento local.

Por isso, é necessário permitir as origens correspondentes.

Quando houver mais de uma origem, os endereços devem ser separados por vírgulas, sem barras finais.

O middleware `middlewares/Cors.js` possui algumas origens padrão e também permite adicionar outras por meio dessa variável.

### `CORS_ORIGIN`

```env
CORS_ORIGIN=http://localhost:3000
```

É uma alternativa utilizada pelo middleware quando `CORS_ORIGINS` não está definida.

No código atual, a prioridade é:

1. `CORS_ORIGINS`.
2. `CORS_ORIGIN`.
3. Origens padrão definidas no middleware.

**Recomenda-se utilizar `CORS_ORIGINS`**, pois o projeto possui mais de uma aplicação frontend.

Não é necessário definir as duas variáveis simultaneamente.

### `SEED_DEMO_REPORTS`

```env
SEED_DEMO_REPORTS=false
```

Controla a criação de dados fictícios destinados à demonstração dos relatórios.

Essa variável é utilizada pelo script `scripts/seed.js`.

Valores:

- `false`: executa o seed básico, sem criar os dados demonstrativos dos relatórios.
- `true`: executa também a criação ou atualização dos dados de demonstração.

A comparação realizada pelo código é com a string exata `"true"`.

### `SEED_DEMO_PASSWORD`

```env
SEED_DEMO_PASSWORD=uma_senha_de_teste_com_8_ou_mais_caracteres
```

Define a senha utilizada nas contas de demonstração criadas pelo seed de relatórios.

Essa variável é exigida **somente quando `SEED_DEMO_REPORTS=true`**.

A senha deve possuir pelo menos oito caracteres.

O script utiliza bcrypt para gerar o hash da senha antes de armazená-la no banco de dados.

> **Importante:** essa senha é destinada exclusivamente às contas fictícias de demonstração. Não utilize credenciais pessoais ou senhas reais.

### Resumo das variáveis

| Variável | Obrigatoriedade | Finalidade |
|---|---|---|
| `DB_USER` | Necessária para a conexão atual | Usuário do MongoDB Atlas |
| `DB_PASS` | Necessária para a conexão atual | Senha do MongoDB Atlas |
| `JWTSECRET` | Necessária para autenticação | Assinatura e validação dos tokens |
| `PORT` | Opcional | Porta HTTP, padrão `8080` |
| `CORS_ORIGINS` | Conforme o ambiente | Lista de origens permitidas |
| `CORS_ORIGIN` | Alternativa opcional | Origem permitida quando `CORS_ORIGINS` não existe |
| `SEED_DEMO_REPORTS` | Opcional | Habilita dados demonstrativos dos relatórios |
| `SEED_DEMO_PASSWORD` | Condicional | Senha das contas demonstrativas |

## Segurança do arquivo `.env`

O arquivo `.env` contém informações sensíveis e não deve ser publicado no GitHub.

O projeto possui um `.gitignore` que ignora arquivos `.env` e suas variações, mantendo a possibilidade de versionar um `.env.example`.

Recomenda-se disponibilizar um `.env.example` com apenas nomes de variáveis e valores fictícios, para orientar novos desenvolvedores sem expor credenciais.

No ambiente de produção, as variáveis devem ser configuradas diretamente nas configurações do serviço de hospedagem.

## Executando a API

Após instalar as dependências e configurar o `.env`, execute:

```bash
npm start
```

O comando executa:

```bash
node index.js
```

Quando a API iniciar, será exibida uma mensagem semelhante a:

```text
API iniciada com sucesso na porta 4000
```

Quando a conexão com o MongoDB Atlas for estabelecida, o sistema exibirá:

```text
Conectado ao mongoDB com sucesso!
```

Com `PORT=4000`, a URL base será:

```text
http://localhost:4000
```

As rotas da API utilizam o prefixo `/api`.

Exemplo:

```text
http://localhost:4000/api/auth/login
```

## Banco de dados MongoDB Atlas

O Lumina utiliza o MongoDB Atlas para armazenamento das informações.

O banco de dados é não relacional e utiliza documentos organizados em coleções.

A aplicação utiliza o Mongoose para definir os modelos e realizar operações de consulta, inserção, atualização e exclusão.

Entre os modelos existentes estão:

- Usuário.
- Fonoaudiólogo.
- Paciente.
- Atividade.
- Tarefa.
- Palavra.
- Nível.
- Tentativa.
- Item.
- Mensagem.
- Notificação.
- Nota clínica.

A conexão é configurada no arquivo:

```text
config/db-connection.js
```

O código atual utiliza o banco denominado `api-lumina`.

> **Atenção:** além de possuir credenciais válidas, o ambiente deve ter permissão de acesso à rede configurada no MongoDB Atlas.

## Scripts disponíveis

O arquivo `package.json` define os seguintes comandos:

| Comando | Descrição |
|---|---|
| `npm start` | Inicia a API com Node.js |
| `npm run seed` | Insere ou atualiza dados iniciais |
| `npm run migrar` | Executa uma migração específica de dados |
| `npm test` | Script de teste ainda não implementado |

### `npm start`

```bash
npm start
```

Inicia o servidor Express por meio do arquivo `index.js`.

### `npm run seed`

```bash
npm run seed
```

Executa o arquivo:

```text
scripts/seed.js
```

O seed é responsável por inserir ou atualizar dados utilizados pela aplicação.

Na versão atual, o script realiza as seguintes operações:

**1. Cadastro de palavras**

Insere ou atualiza seis palavras utilizadas como base para as atividades:

- touro;
- cerca;
- peru;
- vaca;
- pato;
- sapo.

Cada palavra possui informações como sílabas, fonema, posição do fonema e caminhos de recursos de imagem e áudio.

**2. Cadastro de nível**

Cria ou atualiza o nível 1, denominado **A fazenda**, associado às palavras touro, cerca e peru.

**3. Cadastro dos itens da loja**

Insere ou atualiza os itens utilizados na loja da Lolá, incluindo roupas, calçados e acessórios de personalização.

O script contém 25 itens, entre itens iniciais gratuitos e itens com preços em moedas virtuais.

**4. Atualização dos inventários**

Adiciona os itens classificados como iniciais aos inventários dos pacientes ativos.

A operação utiliza `$addToSet`, evitando a inclusão duplicada dos mesmos identificadores de itens.

**5. Dados de demonstração dos relatórios**

Quando `SEED_DEMO_REPORTS=true`, o script também executa a função de geração de dados fictícios para os relatórios.

Essa função cria ou atualiza:

- Uma conta de fonoaudiólogo demonstrativo.
- Quatro pacientes fictícios.
- Registros simulados de tentativas.
- Informações que permitem demonstrar gráficos e indicadores.

Os dados são artificiais e não representam resultados clínicos reais.

#### Como executar somente o seed básico

Configure:

```env
SEED_DEMO_REPORTS=false
```

Depois execute:

```bash
npm run seed
```

#### Como executar o seed com relatórios demonstrativos

Configure:

```env
SEED_DEMO_REPORTS=true
SEED_DEMO_PASSWORD=uma_senha_de_teste_com_8_ou_mais_caracteres
```

Depois execute:

```bash
npm run seed
```

O script cria a conta demonstrativa:

```text
Usuário: lola.demo.fono
Senha: definida em SEED_DEMO_PASSWORD
```

A senha não está definida diretamente no código.

O script também cria contas de pacientes fictícios associadas ao profissional demonstrativo.

> **Importante:** o script utiliza operações de atualização e inserção para permitir novas execuções sem duplicar indiscriminadamente os mesmos registros. Entretanto, sua execução modifica o banco de dados conectado.

Por isso, não é recomendado executá-lo sem necessidade em um ambiente com dados importantes.

Além disso, o seed de relatórios utiliza identificadores estáveis e atualiza tentativas demonstrativas. Não deve ser confundido com um processo de coleta de dados clínicos reais.

### `npm run migrar`

```bash
npm run migrar
```

Executa:

```text
scripts/migrar.js
```

O script realiza ajustes específicos em dados já existentes.

Entre suas operações estão:

- Padronização de valores da categoria de som de palavras.
- Conversão de campos antigos de atividades.
- Adequação dos campos `fonemas`, `posicoes` e `dias_semana`.
- Remoção de campos antigos após a conversão.

> **Atenção:** a migração modifica documentos existentes e não deve ser executada automaticamente em toda inicialização.

Recomenda-se realizar um backup antes de executar migrações em bancos com dados importantes.

## Autenticação e autorização

O backend utiliza JWT para autenticar os usuários.

Após um login válido, a API retorna um token que deve ser enviado nas requisições protegidas.

Exemplo:

```http
Authorization: Bearer SEU_TOKEN
```

O middleware `Auth.js` verifica:

1. Se o token foi enviado.
2. Se o formato é válido.
3. Se a assinatura e o prazo de validade são válidos.
4. Se o usuário existe e está ativo.
5. Se o usuário possui permissão para acessar a funcionalidade.

### Perfis de acesso

O sistema possui dois tipos principais de usuário:

**Fonoaudiólogo (`Fono`)**

Pode acessar funcionalidades administrativas permitidas, como gerenciamento de pacientes, atividades, relatórios e outras informações profissionais.

**Paciente (`Paciente`)**

Pode acessar funcionalidades da aplicação infantil, respeitando as permissões definidas no backend.

O projeto utiliza middlewares para restringir operações a determinados perfis.

### Acesso às mensagens da Lolá

As rotas de mensagens do aplicativo infantil possuem uma camada adicional de autorização do responsável.

Além do token de autenticação, determinadas operações exigem um token específico enviado no cabeçalho:

```http
X-Responsavel-Token: TOKEN_DO_RESPONSAVEL
```

Essa verificação é realizada pelo middleware `AuthResponsavel.js`.

## Principais grupos de rotas

Todas as rotas estão registradas com o prefixo `/api`.

| Grupo | Finalidade |
|---|---|
| `/api/auth` | Login, senha e operações de conta |
| `/api/fonoaudiologos` | Cadastro e perfil profissional |
| `/api/pacientes` | Gerenciamento de pacientes e notas clínicas |
| `/api/atividades` | Gerenciamento de atividades |
| `/api/tarefas` | Consulta e gerenciamento de tarefas |
| `/api/agenda` | Consulta de agenda |
| `/api/mensagens` | Mensagens do Dashboard |
| `/api/relatorios` | Indicadores e relatórios |
| `/api/app` | Funcionalidades destinadas à Lolá |

### Exemplos de endpoints

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | `/api/auth/login` | Autenticação |
| PUT | `/api/auth/senha` | Alteração de senha |
| POST | `/api/fonoaudiologos` | Cadastro profissional |
| GET | `/api/fonoaudiologos/me` | Consulta do perfil profissional |
| GET | `/api/pacientes` | Listagem de pacientes |
| POST | `/api/pacientes` | Cadastro de pacientes |
| GET | `/api/atividades` | Listagem de atividades |
| POST | `/api/atividades` | Cadastro de atividades |
| GET | `/api/relatorios/resumo` | Resumo dos indicadores |
| GET | `/api/relatorios/evolucao` | Relatório de evolução |
| GET | `/api/app/home` | Informações da página inicial da Lolá |
| GET | `/api/app/niveis` | Consulta dos níveis |
| POST | `/api/app/tentativas` | Registro de tentativas |
| GET | `/api/app/loja` | Consulta da loja |
| POST | `/api/app/loja/comprar` | Compra de itens |
| GET | `/api/app/inventario` | Consulta do inventário |

Esta tabela apresenta apenas uma visão geral. Os métodos, parâmetros, permissões, campos obrigatórios e respostas devem ser consultados nos arquivos da pasta `routes/` e nos respectivos controllers.

## Integração com os frontends

O Dashboard e a Lolá enviam requisições HTTP ao backend.

Em ambiente local, com `PORT=4000`, a URL base é:

```text
http://localhost:4000
```

Em produção:

```text
https://lumina-backend-6mk6.onrender.com
```

Os frontends podem utilizar a variável:

```env
NEXT_PUBLIC_API_URL=https://lumina-backend-6mk6.onrender.com
```

Essa variável pertence à configuração dos projetos frontend.

Ela não é necessária no `.env` do backend.

As origens dos frontends devem ser autorizadas na configuração de CORS da API.

## Upload de arquivos

O projeto utiliza Multer para processar arquivos enviados em determinadas operações.

Os uploads são gerenciados pelo middleware:

```text
middlewares/Upload.js
```

Os arquivos são disponibilizados pelo servidor por meio do caminho:

```text
/uploads
```

A aplicação utiliza armazenamento local de arquivos na pasta `uploads/`.

> **Observação:** em ambientes de hospedagem com sistema de arquivos temporário, os uploads locais podem não permanecer disponíveis após reinicializações ou novos deployments.

Para armazenamento persistente em produção, é recomendável utilizar um serviço externo de armazenamento ou um volume persistente, conforme a infraestrutura disponível.

## Relatórios e dados demonstrativos

O backend possui serviços e controllers destinados à geração de relatórios.

Entre os indicadores disponibilizados estão:

- Resumo de acompanhamento.
- Informações relacionadas aos fonemas.
- Dados de atividades.
- Evolução.
- Ranking.

Nesta etapa do projeto, os relatórios podem ser demonstrados com registros fictícios gerados pelo seed.

Esses registros permitem visualizar o funcionamento dos indicadores e gráficos, mas **não devem ser interpretados como resultados clínicos reais ou evidências de eficácia terapêutica**.

## Testes da API

As rotas podem ser testadas utilizando ferramentas como Postman ou Insomnia.

### Exemplo de autenticação

Método:

```http
POST /api/auth/login
```

URL local:

```text
http://localhost:4000/api/auth/login
```

Corpo da requisição:

```json
{
  "usuario": "usuario_de_teste",
  "senha": "senha_de_teste"
}
```

Em caso de autenticação válida, a API retorna um token JWT e informações relacionadas ao usuário.

### Exemplo de requisição autenticada

```http
GET /api/pacientes
Authorization: Bearer SEU_TOKEN
```

A listagem de pacientes exige autenticação e permissão de fonoaudiólogo.

### Testes automatizados

O `package.json` contém um script `npm test`, mas ele ainda não executa uma suíte de testes automatizados.

Portanto, a presença desse comando não deve ser interpretada como implementação de testes automatizados no projeto.

## Problemas comuns

### Erro ao conectar ao MongoDB Atlas

Verifique:

- `DB_USER` e `DB_PASS`.
- Permissões do usuário de banco de dados.
- Acesso de rede configurado no Atlas.
- Endereço do cluster definido em `config/db-connection.js`.
- Disponibilidade da conexão com a internet.

### Erro de autenticação

Verifique:

- `JWTSECRET`.
- Credenciais informadas.
- Validade do token.
- Situação da conta.
- Cabeçalho `Authorization`.

### Erro de CORS

Verifique se a origem do frontend está incluída em `CORS_ORIGINS`.

O endereço deve corresponder à origem utilizada pelo navegador, incluindo protocolo e domínio.

### Porta diferente da esperada

Verifique o valor de `PORT`.

Sem essa variável, a aplicação utiliza a porta `8080`.

### Erro ao executar o seed de relatórios

Verifique se:

```env
SEED_DEMO_REPORTS=true
```

E se `SEED_DEMO_PASSWORD` foi configurada com pelo menos oito caracteres.

### Erro ao acessar arquivos enviados

Verifique se o arquivo existe na pasta `uploads/` e se o ambiente de hospedagem mantém os arquivos armazenados.

## Limitações e estado atual

O backend está preparado para atender o Dashboard e a Lolá, mas o projeto continua em evolução.

Algumas funcionalidades possuem integração parcial com os frontends, enquanto outras dependem de etapas futuras de implementação.

Os dados demonstrativos de relatórios não representam medições clínicas reais.

A configuração completa da Lolá como PWA também não faz parte do backend e ainda está prevista para evolução do frontend infantil.

## Boas práticas de segurança

- Não publicar o `.env` no GitHub.
- Não expor senhas do MongoDB Atlas.
- Não compartilhar a chave `JWTSECRET`.
- Utilizar HTTPS em produção.
- Manter autenticação e autorização nas rotas protegidas.
- Restringir o acesso ao MongoDB Atlas.
- Utilizar dados fictícios durante demonstrações.
- Realizar backups antes de migrações.
- Evitar executar scripts de seed sem verificar o banco conectado.
- Não utilizar dados clínicos reais sem as medidas adequadas de proteção.

## Objetivo do projeto

O Lumina Backend tem como objetivo oferecer uma infraestrutura centralizada para o funcionamento das aplicações do ecossistema Lumina.

A API permite organizar as operações relacionadas a usuários, pacientes, atividades, tarefas, mensagens, relatórios e funcionalidades da aplicação infantil.

O sistema foi desenvolvido como uma ferramenta tecnológica de apoio ao acompanhamento fonoaudiológico, sem substituir a avaliação, o diagnóstico ou a intervenção realizados por profissionais habilitados.

---

**Projeto Integrador — Fatec Registro**  
**Curso:** Desenvolvimento de Software Multiplataforma  
**Projeto:** Lumina — Gamificando a Fala
