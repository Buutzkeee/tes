# Guia de API - Sistema SaaS para Advogados

Este documento detalha todas as APIs disponíveis no Sistema SaaS para Advogados, incluindo endpoints, parâmetros, formatos de requisição e resposta.

## Autenticação

Todas as APIs (exceto login e registro) requerem autenticação via token JWT no cabeçalho:

```
Authorization: Bearer {seu_token_jwt}
```

### Endpoints de Autenticação

#### Registro de Advogado

```
POST /api/auth/register
```

**Corpo da Requisição:**
```json
{
  "name": "Nome Completo",
  "email": "advogado@exemplo.com",
  "password": "senha123",
  "oabNumber": "123456",
  "oabState": "SP",
  "phone": "11999999999"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Nome Completo",
      "email": "advogado@exemplo.com",
      "oabNumber": "123456",
      "oabState": "SP",
      "createdAt": "2025-04-23T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registro realizado com sucesso"
}
```

#### Login

```
POST /api/auth/login
```

**Corpo da Requisição:**
```json
{
  "email": "advogado@exemplo.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Nome Completo",
      "email": "advogado@exemplo.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login realizado com sucesso"
}
```

#### Verificar Token

```
GET /api/auth/verify
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "1",
      "name": "Nome Completo",
      "email": "advogado@exemplo.com"
    }
  },
  "message": "Token válido"
}
```

#### Renovar Token

```
POST /api/auth/refresh
```

**Corpo da Requisição:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token renovado com sucesso"
}
```

## Clientes

### Listar Clientes

```
GET /api/clients
```

**Parâmetros de Consulta:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Termo de busca
- `sort` (opcional): Campo para ordenação
- `order` (opcional): Direção da ordenação (asc/desc)

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "1",
        "name": "Cliente Exemplo",
        "email": "cliente@exemplo.com",
        "cpf": "12345678900",
        "phone": "11999999999",
        "address": "Rua Exemplo, 123",
        "createdAt": "2025-04-23T10:30:00.000Z"
      }
    ],
    "pagination": {
      "totalItems": 50,
      "totalPages": 5,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  },
  "message": "Clientes listados com sucesso"
}
```

### Obter Cliente

```
GET /api/clients/:id
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "1",
      "name": "Cliente Exemplo",
      "email": "cliente@exemplo.com",
      "cpf": "12345678900",
      "phone": "11999999999",
      "address": "Rua Exemplo, 123",
      "createdAt": "2025-04-23T10:30:00.000Z",
      "processes": [
        {
          "id": "1",
          "number": "1234567-89.2025.8.26.0100",
          "title": "Processo Exemplo"
        }
      ]
    }
  },
  "message": "Cliente encontrado com sucesso"
}
```

### Criar Cliente

```
POST /api/clients
```

**Corpo da Requisição:**
```json
{
  "name": "Cliente Novo",
  "email": "cliente.novo@exemplo.com",
  "cpf": "98765432100",
  "phone": "11988888888",
  "address": "Rua Nova, 456"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "2",
      "name": "Cliente Novo",
      "email": "cliente.novo@exemplo.com",
      "cpf": "98765432100",
      "phone": "11988888888",
      "address": "Rua Nova, 456",
      "createdAt": "2025-04-23T11:30:00.000Z"
    }
  },
  "message": "Cliente criado com sucesso"
}
```

### Atualizar Cliente

```
PUT /api/clients/:id
```

**Corpo da Requisição:**
```json
{
  "name": "Cliente Atualizado",
  "email": "cliente.atualizado@exemplo.com",
  "phone": "11977777777",
  "address": "Rua Atualizada, 789"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "2",
      "name": "Cliente Atualizado",
      "email": "cliente.atualizado@exemplo.com",
      "cpf": "98765432100",
      "phone": "11977777777",
      "address": "Rua Atualizada, 789",
      "updatedAt": "2025-04-23T12:30:00.000Z"
    }
  },
  "message": "Cliente atualizado com sucesso"
}
```

### Remover Cliente

```
DELETE /api/clients/:id
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Cliente removido com sucesso"
}
```

## Processos

### Listar Processos

```
GET /api/processes
```

**Parâmetros de Consulta:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Termo de busca
- `clientId` (opcional): Filtrar por cliente
- `status` (opcional): Filtrar por status
- `sort` (opcional): Campo para ordenação
- `order` (opcional): Direção da ordenação (asc/desc)

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "processes": [
      {
        "id": "1",
        "number": "1234567-89.2025.8.26.0100",
        "title": "Processo Exemplo",
        "description": "Descrição do processo",
        "type": "Cível",
        "court": "TJSP",
        "status": "ACTIVE",
        "clientId": "1",
        "client": {
          "id": "1",
          "name": "Cliente Exemplo"
        },
        "createdAt": "2025-04-23T10:30:00.000Z"
      }
    ],
    "pagination": {
      "totalItems": 30,
      "totalPages": 3,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  },
  "message": "Processos listados com sucesso"
}
```

### Obter Processo

```
GET /api/processes/:id
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "process": {
      "id": "1",
      "number": "1234567-89.2025.8.26.0100",
      "title": "Processo Exemplo",
      "description": "Descrição do processo",
      "type": "Cível",
      "court": "TJSP",
      "status": "ACTIVE",
      "clientId": "1",
      "client": {
        "id": "1",
        "name": "Cliente Exemplo",
        "email": "cliente@exemplo.com"
      },
      "documents": [
        {
          "id": "1",
          "title": "Petição Inicial",
          "type": "PETITION"
        }
      ],
      "createdAt": "2025-04-23T10:30:00.000Z"
    }
  },
  "message": "Processo encontrado com sucesso"
}
```

### Criar Processo

```
POST /api/processes
```

**Corpo da Requisição:**
```json
{
  "number": "9876543-21.2025.8.26.0100",
  "title": "Novo Processo",
  "description": "Descrição do novo processo",
  "type": "Trabalhista",
  "court": "TRT",
  "status": "ACTIVE",
  "clientId": "1"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "process": {
      "id": "2",
      "number": "9876543-21.2025.8.26.0100",
      "title": "Novo Processo",
      "description": "Descrição do novo processo",
      "type": "Trabalhista",
      "court": "TRT",
      "status": "ACTIVE",
      "clientId": "1",
      "createdAt": "2025-04-23T11:30:00.000Z"
    }
  },
  "message": "Processo criado com sucesso"
}
```

### Atualizar Processo

```
PUT /api/processes/:id
```

**Corpo da Requisição:**
```json
{
  "title": "Processo Atualizado",
  "description": "Descrição atualizada",
  "status": "PENDING"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "process": {
      "id": "2",
      "number": "9876543-21.2025.8.26.0100",
      "title": "Processo Atualizado",
      "description": "Descrição atualizada",
      "type": "Trabalhista",
      "court": "TRT",
      "status": "PENDING",
      "clientId": "1",
      "updatedAt": "2025-04-23T12:30:00.000Z"
    }
  },
  "message": "Processo atualizado com sucesso"
}
```

### Remover Processo

```
DELETE /api/processes/:id
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Processo removido com sucesso"
}
```

## Documentos

### Listar Documentos

```
GET /api/documents
```

**Parâmetros de Consulta:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Termo de busca
- `processId` (opcional): Filtrar por processo
- `clientId` (opcional): Filtrar por cliente
- `type` (opcional): Filtrar por tipo
- `sort` (opcional): Campo para ordenação
- `order` (opcional): Direção da ordenação (asc/desc)

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "1",
        "title": "Petição Inicial",
        "description": "Petição inicial do processo",
        "type": "PETITION",
        "fileUrl": "https://exemplo.com/documentos/peticao.pdf",
        "fileSize": 1024,
        "processId": "1",
        "clientId": "1",
        "createdAt": "2025-04-23T10:30:00.000Z"
      }
    ],
    "pagination": {
      "totalItems": 20,
      "totalPages": 2,
      "currentPage": 1,
      "itemsPerPage": 10
    }
  },
  "message": "Documentos listados com sucesso"
}
```

### Obter Documento

```
GET /api/documents/:id
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "1",
      "title": "Petição Inicial",
      "description": "Petição inicial do processo",
      "type": "PETITION",
      "fileUrl": "https://exemplo.com/documentos/peticao.pdf",
      "fileSize": 1024,
      "processId": "1",
      "process": {
        "id": "1",
        "number": "1234567-89.2025.8.26.0100",
        "title": "Processo Exemplo"
      },
      "clientId": "1",
      "client": {
        "id": "1",
        "name": "Cliente Exemplo"
      },
      "content": "Conteúdo da petição...",
      "createdAt": "2025-04-23T10:30:00.000Z"
    }
  },
  "message": "Documento encontrado com sucesso"
}
```

### Criar Documento

```
POST /api/documents
```

**Corpo da Requisição (multipart/form-data):**
- `title`: Título do documento
- `description`: Descrição do documento
- `type`: Tipo do documento (PETITION, CONTRACT, EVIDENCE, OTHER)
- `processId`: ID do processo (opcional)
- `clientId`: ID do cliente (opcional)
- `content`: Conteúdo do documento (opcional)
- `file`: Arquivo do documento (opcional)

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "2",
      "title": "Contrato",
      "description": "Contrato de prestação de serviços",
      "type": "CONTRACT",
      "fileUrl": "https://exemplo.com/documentos/contrato.pdf",
      "fileSize": 2048,
      "processId": "1",
      "clientId": "1",
      "createdAt": "2025-04-23T11:30:00.000Z"
    }
  },
  "message": "Documento criado com sucesso"
}
```

### Atualizar Documento

```
PUT /api/documents/:id
```

**Corpo da Requisição:**
```json
{
  "title": "Contrato Atualizado",
  "description": "Descrição atualizada"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "2",
      "title": "Contrato Atualizado",
      "description": "Descrição atualizada",
      "type": "CONTRACT",
      "fileUrl": "https://exemplo.com/documentos/contrato.pdf",
      "fileSize": 2048,
      "processId": "1",
      "clientId": "1",
      "updatedAt": "2025-04-23T12:30:00.000Z"
    }
  },
  "message": "Documento atualizado com sucesso"
}
```

### Remover Documento

```
DELETE /api/documents/:id
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Documento removido com sucesso"
}
```

## Assistente de IA

### Chat com IA

```
POST /api/ai/chat
```

**Corpo da Requisição:**
```json
{
  "message": "O que é habeas corpus?",
  "processId": "1" // opcional
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": "Habeas corpus é uma garantia constitucional que visa proteger a liberdade de locomoção do indivíduo contra prisão ou detenção ilegal...",
    "sources": [
      {
        "title": "Constituição Federal",
        "reference": "Art. 5º, LXVIII"
      }
    ]
  },
  "message": "Resposta gerada com sucesso"
}
```

### Listar Tipos de Petições

```
GET /api/ai/petition-types
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "types": [
      {
        "id": "1",
        "name": "Petição Inicial",
        "description": "Documento que inicia um processo judicial"
      },
      {
        "id": "2",
        "name": "Contestação",
        "description": "Resposta do réu à petição inicial"
      },
      {
        "id": "3",
        "name": "Recurso de Apelação",
        "description": "Recurso contra sentença de primeira instância"
      }
    ]
  },
  "message": "Tipos de petições listados com sucesso"
}
```

### Gerar Petição

```
POST /api/ai/generate-petition
```

**Corpo da Requisição:**
```json
{
  "processId": "1",
  "petitionType": "1",
  "customInstructions": "Incluir argumentos sobre prescrição"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "petition": {
      "title": "Petição Inicial - Processo nº 1234567-89.2025.8.26.0100",
      "content": "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CÍVEL...",
      "references": [
        {
          "title": "Código Civil",
          "article": "Art. 205"
        }
      ]
    }
  },
  "message": "Petição gerada com sucesso"
}
```

### Buscar Jurisprudência

```
POST /api/ai/search-jurisprudence
```

**Corpo da Requisição:**
```json
{
  "query": "usucapião extraordinário",
  "courts": ["STF", "STJ", "TJSP"],
  "dateRange": "last_5_years",
  "processId": "1" // opcional
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "title": "Recurso Especial nº 1.234.567",
        "court": "STJ",
        "number": "REsp 1.234.567/SP",
        "date": "2023-05-10",
        "judge": "Ministro João Silva",
        "summary": "Ementa: RECURSO ESPECIAL. USUCAPIÃO EXTRAORDINÁRIO...",
        "content": "Texto completo do acórdão...",
        "url": "https://exemplo.com/jurisprudencia/1234567"
      }
    ],
    "totalResults": 15,
    "page": 1,
    "totalPages": 2
  },
  "message": "Busca realizada com sucesso"
}
```

## Pagamentos

### Listar Planos

```
GET /api/payments/plans
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "1",
        "name": "Básico",
        "description": "Plano básico para advogados individuais",
        "price": 99.90,
        "interval": "month",
        "features": [
          "Até 50 clientes",
          "Até 100 processos",
          "Armazenamento de 5GB"
        ]
      },
      {
        "id": "2",
        "name": "Profissional",
        "description": "Plano para escritórios de pequeno porte",
        "price": 199.90,
        "interval": "month",
        "features": [
          "Até 200 clientes",
          "Até 500 processos",
          "Armazenamento de 20GB",
          "Assistente de IA avançado"
        ]
      }
    ]
  },
  "message": "Planos listados com sucesso"
}
```

### Obter Assinatura Atual

```
GET /api/payments/subscription
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_123456",
      "status": "active",
      "currentPeriodStart": "2025-04-01T00:00:00.000Z",
      "currentPeriodEnd": "2025-05-01T00:00:00.000Z",
      "plan": {
        "id": "1",
        "name": "Básico",
        "price": 99.90
      }
    }
  },
  "message": "Assinatura encontrada com sucesso"
}
```

### Assinar Plano

```
POST /api/payments/subscribe
```

**Corpo da Requisição:**
```json
{
  "planId": "2",
  "paymentMethodId": "pm_123456789"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_987654",
      "status": "active",
      "currentPeriodStart": "2025-04-23T00:00:00.000Z",
      "currentPeriodEnd": "2025-05-23T00:00:00.000Z",
      "plan": {
        "id": "2",
        "name": "Profissional",
        "price": 199.90
      }
    }
  },
  "message": "Assinatura realizada com sucesso"
}
```

### Cancelar Assinatura

```
POST /api/payments/cancel
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_987654",
      "status": "canceled",
      "canceledAt": "2025-04-23T12:30:00.000Z",
      "currentPeriodEnd": "2025-05-23T00:00:00.000Z"
    }
  },
  "message": "Assinatura cancelada com sucesso"
}
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso proibido |
| 404 | Recurso não encontrado |
| 409 | Conflito |
| 422 | Entidade não processável |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

## Formato de Erro

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "O recurso solicitado não foi encontrado",
    "details": {
      "param": "id",
      "value": "999"
    }
  }
}
```

---

© 2025 Sistema SaaS para Advogados. Todos os direitos reservados.
