# Guia de Execução com Docker 🐳

Este guia fornece instruções para executar o projeto usando Docker

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- Portas 3000 e 5000 disponíveis no sistema

## Executando a Aplicação

### 1. Iniciar os containers

No diretório raiz do projeto, execute:

```bash
docker-compose up --build
```

Este comando irá:

1. Construir as imagens Docker do backend e frontend
2. Criar a rede interna para comunicação entre containers
3. Criar o volume para persistência do banco de dados SQLite
4. Iniciar os serviços

### 2. Acessar a aplicação

Aguarde a mensagem de inicialização (aproximadamente 30-60 segundos) e acesse:

- **Frontend (Interface)**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Swagger (Documentação)**: http://localhost:5001/swagger

### 3. Parar os containers

Para parar os containers sem remover os dados:

```bash
docker-compose down
```

## Comandos Úteis

### Ver logs em tempo real

```bash
docker-compose logs -f
```

### Ver logs apenas do backend

```bash
docker-compose logs -f backend
```

### Ver logs apenas do frontend

```bash
docker-compose logs -f frontend
```

### Reiniciar containers

```bash
docker-compose restart
```

### Reiniciar apenas o backend

```bash
docker-compose restart backend
```

### Limpar tudo e reiniciar (remove volumes e dados)

```bash
docker-compose down -v
docker-compose up --build
```

### Acessar shell do container backend

```bash
docker exec -it vacation-manager-backend /bin/bash
```

### Acessar shell do container frontend

```bash
docker exec -it vacation-manager-frontend /bin/sh
```

## Estrutura dos Containers

### Backend Container

- **Imagem**: .NET 8.0 runtime
- **Porta**: 5001 (host) → 5000 (container)
- **Volume**: `sqlite-data:/app/data` (persistência do banco)
- **Variáveis de ambiente**:
  - `ASPNETCORE_ENVIRONMENT=Development`
  - `ASPNETCORE_URLS=http://+:5000`
  - `DB_PATH=/app/data/vacationmanager.db`

### Frontend Container

- **Imagem**: Node 18 Alpine
- **Porta**: 3000
- **Servidor**: serve (production build)

### Network

- **Nome**: `vacation-manager-network`
- **Driver**: bridge
- **Permite**: Comunicação interna entre containers

## Persistência de Dados

O banco de dados SQLite é armazenado em um volume Docker nomeado `sqlite-data`. Isso garante que:

- ✅ Os dados persistem entre reinicializações dos containers
- ✅ Os dados sobrevivem ao comando `docker-compose down`
- ❌ Os dados são removidos com `docker-compose down -v`

### Localização do volume

Para inspecionar o volume:

```bash
docker volume inspect vacation-manager_sqlite-data
```

## Dados Iniciais (Seed)

O backend cria automaticamente os seguintes usuários na primeira execução:

| Nome        | Email                 | Senha | Perfil  |
| ----------- | --------------------- | ----- | ------- |
| Admin User  | admin@vacation.com    | -     | Admin   |
| Manager One | manager1@vacation.com | -     | Manager |
| Manager Two | manager2@vacation.com | -     | Manager |

## Troubleshooting

### Porta já em uso

Se receber erro de porta em uso:

```bash
# Para Windows/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Para Linux
sudo lsof -ti:3000 | xargs sudo kill -9
sudo lsof -ti:5000 | xargs sudo kill -9
```

### Container não inicia

1. Verifique os logs: `docker-compose logs`
2. Reconstrua as imagens: `docker-compose build --no-cache`
3. Limpe containers antigos: `docker system prune -a`

### Banco de dados corrompido

Para resetar completamente o banco:

```bash
docker-compose down -v
docker-compose up --build
```

### Frontend não conecta ao backend

1. Verifique se ambos containers estão rodando: `docker ps`
2. Verifique logs do backend: `docker-compose logs backend`
3. Teste a API diretamente: http://localhost:5001/api/users

## Desenvolvimento

### Modificando código

Após modificar o código, reconstrua os containers:

```bash
docker-compose up --build
```

### Debug do backend

Para debugar o .NET, você pode anexar um debugger remoto:

1. Expor porta de debug no `docker-compose.yml`
2. Configurar VS Code/Visual Studio para debug remoto
3. Anexar ao processo
