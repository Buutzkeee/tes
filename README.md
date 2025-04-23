# Sistema SaaS para Advogados - Documentação

## Sumário

1. [Introdução](#introdução)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Requisitos de Sistema](#requisitos-de-sistema)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [API Backend](#api-backend)
7. [Frontend](#frontend)
8. [Banco de Dados](#banco-de-dados)
9. [Autenticação e Segurança](#autenticação-e-segurança)
10. [Integração com IA](#integração-com-ia)
11. [Sistema de Pagamentos](#sistema-de-pagamentos)
12. [Manutenção e Backup](#manutenção-e-backup)
13. [Testes](#testes)
14. [Troubleshooting](#troubleshooting)
15. [FAQ](#faq)

## Introdução

O Sistema SaaS para Advogados é uma plataforma completa para gerenciamento de escritórios de advocacia, desenvolvida para otimizar processos, aumentar a produtividade e melhorar a experiência de advogados e clientes.

### Principais Funcionalidades

- Cadastro e gerenciamento de advogados
- Gerenciamento de clientes
- Controle de processos jurídicos
- Gestão de documentos
- Controle de prazos e compromissos
- Assistente jurídico com IA
- Geração de petições
- Busca de jurisprudência
- Sistema de cobrança por assinatura
- Painel administrativo

## Arquitetura do Sistema

O sistema foi desenvolvido seguindo uma arquitetura moderna e escalável:

- **Backend**: Node.js com Express.js e Prisma ORM
- **Frontend**: React com Next.js e Tailwind CSS
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Autenticação**: JWT + OAuth
- **Containerização**: Docker e Docker Compose

### Diagrama de Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│  (Next.js/React)│     │ (Node.js/Express)│     │  (Banco de Dados)│
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │  ▲
                               │  │
                               ▼  │
                        ┌─────────────────┐
                        │                 │
                        │      Redis      │
                        │     (Cache)     │
                        │                 │
                        └─────────────────┘
```

## Requisitos de Sistema

### Requisitos Mínimos

- Docker 20.10.x ou superior
- Docker Compose 2.x ou superior
- 2GB de RAM
- 10GB de espaço em disco
- Conexão com a internet

### Requisitos Recomendados

- 4GB de RAM ou mais
- 20GB de espaço em disco
- Processador multi-core
- Conexão de internet estável

## Instalação e Configuração

### Pré-requisitos

Certifique-se de ter o Docker e o Docker Compose instalados em seu sistema:

```bash
docker --version
docker-compose --version
```

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/advogados-saas.git
   cd advogados-saas
   ```

2. Execute o script de inicialização:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. Acesse o sistema:
   - Frontend: http://localhost:3000
   - API Backend: http://localhost:3001/api

### Configuração Personalizada

Para personalizar as configurações, edite o arquivo `.env` antes de executar o script de inicialização. As principais variáveis que podem ser configuradas são:

- `POSTGRES_USER`: Usuário do banco de dados
- `POSTGRES_PASSWORD`: Senha do banco de dados
- `JWT_SECRET`: Chave secreta para geração de tokens JWT
- `PORT`: Porta do backend

## Estrutura do Projeto

```
advogados-saas/
├── backend/                # Código do backend
│   ├── prisma/             # Esquema e migrações do banco de dados
│   ├── src/                # Código fonte
│   │   ├── api/            # Rotas, controladores e middlewares
│   │   ├── services/       # Serviços de negócio
│   │   ├── config/         # Configurações
│   │   ├── utils/          # Utilitários
│   │   └── app.ts          # Aplicação Express
│   ├── Dockerfile          # Configuração Docker para o backend
│   └── package.json        # Dependências do backend
├── frontend/               # Código do frontend
│   ├── src/                # Código fonte
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos React
│   │   ├── pages/          # Páginas Next.js
│   │   └── services/       # Serviços de API
│   ├── Dockerfile          # Configuração Docker para o frontend
│   └── package.json        # Dependências do frontend
├── tests/                  # Testes automatizados
├── docker-compose.yml      # Configuração Docker Compose
├── start.sh                # Script de inicialização
├── stop.sh                 # Script para parar a aplicação
└── backup.sh               # Script de backup
```

## API Backend

### Endpoints Principais

#### Autenticação

- `POST /api/auth/register`: Registro de novo advogado
- `POST /api/auth/login`: Login de advogado
- `GET /api/auth/verify`: Verificação de token JWT
- `POST /api/auth/refresh`: Renovação de token JWT

#### Clientes

- `GET /api/clients`: Listar todos os clientes
- `GET /api/clients/:id`: Obter detalhes de um cliente
- `POST /api/clients`: Criar novo cliente
- `PUT /api/clients/:id`: Atualizar cliente
- `DELETE /api/clients/:id`: Remover cliente

#### Processos

- `GET /api/processes`: Listar todos os processos
- `GET /api/processes/:id`: Obter detalhes de um processo
- `POST /api/processes`: Criar novo processo
- `PUT /api/processes/:id`: Atualizar processo
- `DELETE /api/processes/:id`: Remover processo

#### Documentos

- `GET /api/documents`: Listar todos os documentos
- `GET /api/documents/:id`: Obter detalhes de um documento
- `POST /api/documents`: Criar novo documento
- `PUT /api/documents/:id`: Atualizar documento
- `DELETE /api/documents/:id`: Remover documento

#### IA

- `POST /api/ai/chat`: Enviar mensagem para o assistente de IA
- `GET /api/ai/petition-types`: Listar tipos de petições disponíveis
- `POST /api/ai/generate-petition`: Gerar petição com IA
- `POST /api/ai/search-jurisprudence`: Buscar jurisprudência

#### Pagamentos

- `GET /api/payments/plans`: Listar planos disponíveis
- `GET /api/payments/subscription`: Obter detalhes da assinatura atual
- `POST /api/payments/subscribe`: Assinar um plano
- `POST /api/payments/cancel`: Cancelar assinatura

### Formato de Resposta

Todas as respostas da API seguem um formato consistente:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

Em caso de erro:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro"
  }
}
```

## Frontend

### Páginas Principais

- `/login`: Página de login
- `/register`: Página de registro
- `/dashboard`: Dashboard principal
- `/clients`: Gerenciamento de clientes
- `/processes`: Gerenciamento de processos
- `/documents`: Gerenciamento de documentos
- `/ai-assistant`: Assistente jurídico com IA
- `/ai-assistant/generate-petition`: Geração de petições
- `/ai-assistant/jurisprudence`: Busca de jurisprudência
- `/payments`: Assinatura e pagamentos

### Componentes Reutilizáveis

O frontend utiliza uma série de componentes reutilizáveis para manter a consistência visual e funcional:

- `Button`: Botões com diferentes variantes e estados
- `Input`: Campos de entrada com validação
- `Alert`: Mensagens de alerta e notificação
- `Modal`: Janelas modais para ações específicas
- `Table`: Tabelas para exibição de dados
- `Card`: Cards para agrupamento de informações
- `Sidebar`: Barra lateral de navegação
- `Header`: Cabeçalho com informações do usuário

## Banco de Dados

### Modelo de Dados

O sistema utiliza o PostgreSQL como banco de dados relacional, com o seguinte esquema:

- **User**: Advogados cadastrados no sistema
- **Client**: Clientes dos advogados
- **Process**: Processos jurídicos
- **Document**: Documentos associados a processos
- **Subscription**: Assinaturas de planos
- **Plan**: Planos disponíveis
- **Payment**: Histórico de pagamentos
- **Notification**: Notificações do sistema

### Migrações

As migrações do banco de dados são gerenciadas pelo Prisma ORM. Para executar migrações manualmente:

```bash
docker-compose exec backend npx prisma migrate deploy
```

## Autenticação e Segurança

### Sistema de Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação, com os seguintes recursos:

- Tokens com expiração configurável
- Refresh tokens para renovação automática
- Proteção contra CSRF
- Validação de OAB para advogados

### Segurança

Medidas de segurança implementadas:

- Senhas armazenadas com hash bcrypt
- Proteção contra ataques de injeção SQL
- Validação de entrada em todas as APIs
- Rate limiting para prevenir ataques de força bruta
- HTTPS para comunicação segura (em produção)

## Integração com IA

### Assistente Jurídico

O sistema integra um assistente jurídico baseado em IA com as seguintes capacidades:

- Responder perguntas jurídicas
- Analisar processos e documentos
- Sugerir estratégias jurídicas
- Fornecer informações sobre legislação e jurisprudência

### Geração de Petições

O módulo de geração de petições permite:

- Criar petições a partir de modelos pré-definidos
- Personalizar conteúdo com base no processo
- Incluir jurisprudência relevante
- Exportar em diferentes formatos

### Busca de Jurisprudência

O sistema oferece busca avançada de jurisprudência:

- Filtros por tribunal, data e tipo de processo
- Análise semântica para resultados mais relevantes
- Salvamento de resultados como documentos
- Citação automática em petições

## Sistema de Pagamentos

### Planos de Assinatura

O sistema oferece diferentes planos de assinatura:

- **Básico**: Funcionalidades essenciais
- **Profissional**: Recursos avançados
- **Empresarial**: Suporte a múltiplos advogados

### Integração com Stripe

O processamento de pagamentos é realizado através do Stripe:

- Pagamentos seguros com cartão de crédito
- Renovação automática de assinaturas
- Notificações de pagamento
- Faturas e recibos automáticos

## Manutenção e Backup

### Backup do Sistema

Para realizar backup do sistema, utilize o script fornecido:

```bash
chmod +x backup.sh
./backup.sh
```

O backup inclui:
- Dump do banco de dados PostgreSQL
- Dados dos volumes Docker
- Configurações do sistema

### Restauração

Para restaurar um backup:

```bash
./restore.sh backups/backup_20250423_120000.tar.gz
```

### Atualizações

Para atualizar o sistema:

1. Pare os containers:
   ```bash
   ./stop.sh
   ```

2. Atualize o código fonte:
   ```bash
   git pull
   ```

3. Reinicie os containers:
   ```bash
   ./start.sh
   ```

## Testes

### Tipos de Testes

O sistema inclui uma suíte completa de testes:

- **Testes Unitários**: Verificam componentes isolados
- **Testes de Integração**: Verificam a interação entre componentes
- **Testes End-to-End**: Simulam interações reais de usuários
- **Testes de Performance**: Avaliam o desempenho sob carga
- **Testes de Segurança**: Verificam vulnerabilidades

### Execução de Testes

Para executar os testes:

```bash
# Testes unitários
docker-compose exec backend npm run test:unit

# Testes de integração
docker-compose exec backend npm run test:integration

# Testes end-to-end
docker-compose exec frontend npm run test:e2e
```

## Troubleshooting

### Problemas Comuns

#### Containers não iniciam

Verifique os logs:
```bash
docker-compose logs
```

Possíveis soluções:
- Verificar se as portas 3000 e 3001 estão disponíveis
- Verificar permissões de arquivos
- Reiniciar o Docker

#### Erro de conexão com o banco de dados

Verifique se o container do PostgreSQL está rodando:
```bash
docker-compose ps postgres
```

Possíveis soluções:
- Verificar variáveis de ambiente no arquivo .env
- Reiniciar o container do PostgreSQL
- Verificar logs do PostgreSQL

#### Frontend não carrega

Verifique os logs do frontend:
```bash
docker-compose logs frontend
```

Possíveis soluções:
- Verificar se o backend está acessível
- Limpar o cache do navegador
- Verificar configuração de CORS no backend

## FAQ

### Perguntas Frequentes

**P: Quantos usuários o sistema suporta?**

R: O sistema foi projetado para suportar desde escritórios individuais até grandes escritórios com dezenas de advogados, dependendo do plano de assinatura.

**P: É possível personalizar o sistema?**

R: Sim, o sistema é altamente personalizável. Você pode modificar o código fonte, adicionar novos módulos ou integrar com outros sistemas.

**P: Como funciona a integração com a OAB?**

R: O sistema simula a validação com a OAB para fins de demonstração. Em um ambiente de produção, seria necessário implementar a integração real com a API da OAB.

**P: O sistema é compatível com dispositivos móveis?**

R: Sim, o frontend foi desenvolvido com design responsivo e funciona perfeitamente em smartphones e tablets.

**P: Como são tratados os dados sensíveis dos clientes?**

R: Todos os dados são armazenados de forma segura, com criptografia em trânsito e em repouso. O sistema segue as melhores práticas de segurança e privacidade.

---

© 2025 Sistema SaaS para Advogados. Todos os direitos reservados.
