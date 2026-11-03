# Lumina - Backend

API responsável por gerenciar os dados e as funcionalidades do sistema **Lumina**, desenvolvido como Projeto Integrador (PI) do curso de Desenvolvimento de Software Multiplataforma da FATEC Registro.

O backend conecta o Dashboard da fonoaudióloga e o PWA utilizado pelas crianças, centralizando a comunicação com o banco de dados e as regras de negócio da aplicação.

## Objetivo

Desenvolver uma API REST para dar suporte às funcionalidades do Lumina, permitindo o gerenciamento de usuários, pacientes, atividades, tarefas, mensagens, agenda e relatórios, além das funcionalidades utilizadas no aplicativo das crianças.

## Tecnologias utilizadas

- **Node.js** – ambiente de execução JavaScript.
- **Express** – criação e gerenciamento das rotas da API.
- **MongoDB** – banco de dados NoSQL.
- **Mongoose** – modelagem e comunicação com o banco de dados.
- **JWT (JSON Web Token)** – autenticação e autorização.
- **Bcrypt** – criptografia de senhas.
- **Multer** – gerenciamento de envio de arquivos.
- **Dotenv** – gerenciamento de variáveis de ambiente.

## Estrutura do projeto

```text
lumina-backend/
│
├── config/          # Configurações do banco de dados
├── controllers/     # Lógica das funcionalidades
├── middlewares/     # Autenticação e permissões
├── models/          # Modelos e estruturas do MongoDB
├── routes/          # Rotas da API
├── scripts/         # Scripts auxiliares
├── services/        # Serviços e regras de negócio
├── uploads/         # Arquivos enviados
├── utils/           # Funções auxiliares
│
├── index.js         # Arquivo principal da aplicação
├── package.json     # Dependências e scripts
└── .env             # Variáveis de ambiente
```

## Como executar o projeto

### 1. Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js
- npm
- Acesso a um banco de dados MongoDB

### 2. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd lumina-backend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e configure as variáveis necessárias:

```env
DB_USER=seu_usuario
DB_PASS=sua_senha
JWTSECRET=sua_chave_secreta
CORS_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
PORT=8080
```

Substitua os valores de exemplo pelas informações do seu ambiente.

**Importante:** o arquivo `.env` não deve ser enviado ao GitHub, pois contém informações sensíveis.

### 5. Iniciar a API

```bash
npm start
```

Por padrão, a API utiliza a porta `8080`.

Endereço local:

```text
http://localhost:8080
```

## Rotas principais

Todas as rotas da API utilizam o prefixo `/api`.

| Funcionalidade | Endpoint |
|---|---|
| Autenticação | `/api/auth` |
| Fonoaudiólogos | `/api/fonoaudiologos` |
| Pacientes | `/api/pacientes` |
| Atividades | `/api/atividades` |
| Tarefas | `/api/tarefas` |
| Agenda | `/api/agenda` |
| Mensagens | `/api/mensagens` |
| Relatórios | `/api/relatorios` |
| Aplicativo (PWA) | `/api/app` |

### Autenticação

A API utiliza JWT para controlar o acesso às funcionalidades. Algumas rotas exigem um token de autenticação enviado no cabeçalho da requisição:

```text
Authorization: Bearer SEU_TOKEN
```

Existem permissões específicas para fonoaudiólogos e pacientes, de acordo com a funcionalidade acessada.

## Funcionalidades da API

- Cadastro, login e gerenciamento de usuários.
- Cadastro e gerenciamento de fonoaudiólogos.
- Cadastro, edição e gerenciamento de pacientes.
- Gerenciamento de atividades e tarefas.
- Controle de agenda.
- Envio e recebimento de mensagens.
- Geração de relatórios e acompanhamento da evolução.
- Funcionalidades do PWA, incluindo atividades, tentativas, níveis, avatar, loja e inventário.
- Gerenciamento de notificações e configurações.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia a API com Nodemon |
| `npm run seed` | Executa o script de inserção de dados iniciais |
| `npm run migrar` | Executa o script de migração de dados |

## Testes

As requisições podem ser testadas utilizando ferramentas como **Insomnia** ou **Postman**.

Utilize a URL base:

```text
http://localhost:8080/api
```

Para testar rotas protegidas, realize primeiro a autenticação e utilize o token JWT retornado nas requisições seguintes.

---

**Projeto Integrador – FATEC Registro**  
Curso: Desenvolvimento de Software Multiplataforma  
Projeto: Lumina
