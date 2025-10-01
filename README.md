# Vacation Manager

Sistema de gestão de férias corporativo desenvolvido para controle e aprovação de solicitações de férias com diferentes níveis de permissão.

## 🚀 Início Rápido

```bash
docker-compose up --build
```

Acesse:

- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- Swagger: http://localhost:5001/swagger

**Requisitos**: Docker Desktop instalado

📖 **Documentação**: [DOCKER.md](DOCKER.md)

## Tecnologias

### Backend

- .NET Core 8.0
- Entity Framework Core
- SQLite Database
- RESTful API

### Frontend

- React 18
- TypeScript
- Bootstrap 5
- Axios

## Funcionalidades

### Gestão de Usuários

- Cadastro, edição e exclusão de usuários
- Três níveis de acesso: Admin, Manager e Colaborador
- Hierarquia organizacional com gerentes e subordinados

### Solicitações de Férias

- Criação de pedidos de férias
- Validação automática de conflitos de datas
- Cálculo de dias úteis (excluindo fins de semana)
- Workflow de aprovação baseado em hierarquia

### Dashboard

- Visão geral de estatísticas
- Pedidos pendentes de aprovação
- Colaboradores em férias
- Próximas férias agendadas

### Permissões por Perfil

**Admin**

- Acesso completo ao sistema
- Gerenciamento de todos os usuários
- Aprovação de qualquer solicitação

**Manager**

- Visualização de usuários
- Aprovação de férias dos subordinados diretos
- Gestão das próprias solicitações

**Colaborador**

- Criação e visualização das próprias solicitações
- Sem acesso ao módulo de usuários

## Instalação

### Opção 1: Com Docker (Recomendado) 🐳

A forma mais rápida e simples de executar o projeto:

```bash
docker-compose up --build
```

Após alguns segundos, a aplicação estará pronta:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

**Requisitos:**

- Docker Desktop instalado
- Nada mais é necessário!

**Recursos do Docker:**

- ✅ Banco de dados SQLite persiste entre reinicializações
- ✅ Dados iniciais (seed) criados automaticamente
- ✅ CORS configurado para comunicação entre containers
- ✅ Hot reload no desenvolvimento

**Comandos úteis:**

```bash
# Parar os containers
docker-compose down

# Reiniciar os containers
docker-compose restart

# Ver logs
docker-compose logs -f

# Limpar tudo e reiniciar
docker-compose down -v
docker-compose up --build
```

### Opção 2: Instalação Manual

#### Backend

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

A API estará disponível em `http://localhost:5000`

#### Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Estrutura do Banco de Dados

### Tabelas

- **Users**: Armazena informações dos usuários e hierarquia
- **VacationRequests**: Registra todas as solicitações de férias

### Dados Iniciais

O sistema já vem com usuários pré-cadastrados para teste:

- Admin User (Administrador)
- Manager One (Gerente)
- Manager Two (Gerente)

## API Endpoints

### Users

- GET `/api/users` - Lista todos os usuários
- GET `/api/users/{id}` - Busca usuário por ID
- POST `/api/users` - Cria novo usuário
- PUT `/api/users/{id}` - Atualiza usuário
- DELETE `/api/users/{id}` - Remove usuário

### Vacation Requests

- GET `/api/vacationrequests` - Lista todas as solicitações
- GET `/api/vacationrequests/{id}` - Busca solicitação por ID
- POST `/api/vacationrequests` - Cria nova solicitação
- POST `/api/vacationrequests/{id}/approve` - Aprova solicitação
- POST `/api/vacationrequests/{id}/reject` - Rejeita solicitação
- DELETE `/api/vacationrequests/{id}` - Remove solicitação

## Regras de Negócio

1. **Validação de Datas**: Não é permitido sobrepor períodos de férias já aprovados
2. **Hierarquia de Aprovação**: Managers só aprovam férias de subordinados diretos
3. **Proteção de Admin**: O usuário administrador não pode ser excluído
4. **Cálculo de Dias**: Sistema calcula automaticamente dias úteis, com opção de incluir fins de semana
5. **Status de Solicitações**: Pending, Approved ou Rejected

## Interface

### Temas

- Suporte para tema claro e escuro
- Persistência de preferência do usuário

### Responsividade

- Layout adaptativo para diferentes tamanhos de tela
- Tabelas responsivas com scroll horizontal quando necessário

### Navegação

- Menu lateral com acesso rápido às funcionalidades
- Seletor de usuário para simular diferentes perfis
- Indicadores visuais de status e permissões

## Arquitetura

### Backend

- **Controllers**: Gerenciam requisições HTTP e respostas
- **Services**: Contêm lógica de negócio e validações
- **Models**: Definem estrutura de dados
- **Data**: Contexto do Entity Framework e configurações

### Frontend

- **Components**: Elementos reutilizáveis da interface
- **Pages**: Telas principais da aplicação
- **Services**: Comunicação com API
- **Utils**: Funções auxiliares e conversores

## Desenvolvimento

O projeto foi estruturado seguindo princípios de clean code e separação de responsabilidades, garantindo manutenibilidade e escalabilidade do sistema.
