# Guia de Instalação e Uso - Sistema SaaS para Advogados

Este guia fornece instruções passo a passo para instalar, configurar e utilizar o Sistema SaaS para Advogados.

## Instalação

### Requisitos

- Docker 20.10.x ou superior
- Docker Compose 2.x ou superior
- 2GB de RAM (mínimo)
- 10GB de espaço em disco (mínimo)
- Conexão com a internet

### Passo 1: Obter o código

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/advogados-saas.git
cd advogados-saas
```

### Passo 2: Configuração

O sistema já vem com configurações padrão, mas você pode personalizá-las editando o arquivo `.env` que será criado automaticamente na primeira execução.

### Passo 3: Iniciar o sistema

Execute o script de inicialização:

```bash
chmod +x start.sh
./start.sh
```

Este script irá:
1. Verificar se o Docker e Docker Compose estão instalados
2. Criar o arquivo `.env` se não existir
3. Construir e iniciar os containers
4. Executar migrações do banco de dados

### Passo 4: Acessar o sistema

Após a inicialização bem-sucedida, acesse:
- Frontend: http://localhost:3000
- API Backend: http://localhost:3001/api

## Primeiros Passos

### Criar uma conta

1. Acesse http://localhost:3000
2. Clique em "Registrar"
3. Preencha o formulário com seus dados
4. Confirme seu registro

### Login

1. Acesse http://localhost:3000
2. Digite seu email e senha
3. Clique em "Entrar"

### Dashboard

Após o login, você será redirecionado para o dashboard, onde poderá:
- Ver estatísticas gerais
- Acessar clientes, processos e documentos
- Verificar prazos e compromissos
- Acessar o assistente de IA

## Funcionalidades Principais

### Gerenciamento de Clientes

Para adicionar um novo cliente:
1. Acesse "Clientes" no menu lateral
2. Clique em "Novo Cliente"
3. Preencha os dados do cliente
4. Clique em "Salvar"

### Gerenciamento de Processos

Para adicionar um novo processo:
1. Acesse "Processos" no menu lateral
2. Clique em "Novo Processo"
3. Selecione o cliente associado
4. Preencha os dados do processo
5. Clique em "Salvar"

### Documentos

Para adicionar um novo documento:
1. Acesse "Documentos" no menu lateral
2. Clique em "Novo Documento"
3. Selecione o processo associado (opcional)
4. Faça upload do arquivo ou crie um novo
5. Clique em "Salvar"

### Assistente de IA

Para utilizar o assistente de IA:
1. Acesse "Assistente IA" no menu lateral
2. Digite sua pergunta no campo de texto
3. Clique em "Enviar"

Para gerar uma petição:
1. Acesse "Assistente IA" > "Gerar Petição"
2. Selecione o processo associado
3. Escolha o tipo de petição
4. Adicione instruções específicas (opcional)
5. Clique em "Gerar Petição"

Para buscar jurisprudência:
1. Acesse "Assistente IA" > "Jurisprudência"
2. Digite os termos de busca
3. Aplique filtros (opcional)
4. Clique em "Buscar"

## Manutenção

### Parar o sistema

Para parar o sistema:

```bash
./stop.sh
```

### Backup

Para fazer backup do sistema:

```bash
./backup.sh
```

Os backups são armazenados no diretório `backups/`.

### Atualização

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

## Suporte

Em caso de problemas, consulte a seção de Troubleshooting no README.md ou entre em contato com o suporte técnico.

---

© 2025 Sistema SaaS para Advogados
