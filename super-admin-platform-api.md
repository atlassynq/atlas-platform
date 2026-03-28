# Atlas Super Admin Platform — API Reference

Documento de referência para a plataforma web de gerenciamento de eventos do Super Admin.

**Base URL:** `https://apiatlasunite.com.br/api`
**Content-Type:** `application/json` (exceto uploads de imagem)

---

## Autenticação

Todos os endpoints protegidos exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via login (seção 1). Endpoints marcados com **[SUPER_ADMIN]** exigem que o usuário autenticado tenha `role = SUPER_ADMIN`.

> **Tokens não possuem validade.** Uma vez emitido, o token é permanente. Para revogar o acesso, altere `SUPER_ADMIN_PASSWORD` no `.env` e reinicie a API — isso força um novo login.

---

## 1. Login

### `POST https://apiatlasunite.com.br/api/auth/login`

Autentica o super admin e retorna o JWT de acesso.

**Auth:** Nenhuma

**Request Body:**
```json
{
  "email": "admin@yourapp.com",
  "password": "sua-senha-forte"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `email` | string | Sim | Email válido |
| `password` | string | Sim | Não vazio |

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "firstName": "Atlas",
    "lastName": "SuperAdmin",
    "email": "admin@yourapp.com",
    "photoUrl": null,
    "bio": null,
    "plan": "FREE"
  }
}
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `400` | Erro de validação dos campos |
| `401` | `"Invalid credentials"` |

---

## 2. Perfil do Super Admin

### `GET https://apiatlasunite.com.br/api/auth/profile`

Retorna os dados do super admin autenticado.

**Auth:** Bearer Token

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "firstName": "Atlas",
  "lastName": "SuperAdmin",
  "email": "admin@yourapp.com",
  "photoUrl": null,
  "bio": null,
  "instagram": null,
  "tiktok": null,
  "linkedin": null,
  "facebook": null,
  "plan": "FREE"
}
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `401` | `"Invalid token"` |
| `404` | `"User not found"` |

---

## 3. Eventos

### 3.1 Criar Evento

### `POST https://apiatlasunite.com.br/api/events`

**Auth:** Bearer Token **[SUPER_ADMIN]**
**Content-Type:** `multipart/form-data` (para upload de imagem) ou `application/json`

**Request Body:**
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `title` | string | Sim | Entre 3 e 100 caracteres |
| `description` | string | Não | Máximo 500 caracteres |
| `coverPhoto` | file (upload) ou string (URL) | Não | Imagem ou URL válida |
| `latitude` | number | Sim | Entre -90 e 90 |
| `longitude` | number | Sim | Entre -180 e 180 |
| `startTime` | string (ISO 8601) | Sim | Data futura |
| `endTime` | string (ISO 8601) | Sim | Posterior a `startTime` |

**Exemplo (JSON):**
```json
{
  "title": "Festival de Verão Atlas",
  "description": "Evento ao ar livre no parque central.",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "startTime": "2026-04-15T18:00:00.000Z",
  "endTime": "2026-04-15T23:00:00.000Z"
}
```

**Exemplo (multipart/form-data):**
```
title: Festival de Verão Atlas
description: Evento ao ar livre no parque central.
latitude: -23.5505
longitude: -46.6333
startTime: 2026-04-15T18:00:00.000Z
endTime: 2026-04-15T23:00:00.000Z
coverPhoto: <arquivo de imagem>
```

**Response `201 Created`:**
```json
{
  "id": "uuid",
  "title": "Festival de Verão Atlas",
  "description": "Evento ao ar livre no parque central.",
  "coverPhoto": "https://res.cloudinary.com/.../atlas/events/...",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "startTime": "2026-04-15T18:00:00.000Z",
  "endTime": "2026-04-15T23:00:00.000Z",
  "creatorId": "uuid",
  "createdAt": "2026-03-28T10:00:00.000Z",
  "updatedAt": "2026-03-28T10:00:00.000Z",
  "creator": {
    "id": "uuid",
    "firstName": "Atlas",
    "lastName": "SuperAdmin",
    "photoUrl": null
  }
}
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `400` | Erros de validação (campos inválidos, datas inválidas) |
| `401` | Token inválido ou ausente |
| `403` | `"Access denied. Super Admin privileges required."` |

---

### 3.2 Listar Todos os Eventos

### `GET https://apiatlasunite.com.br/api/events`

Lista todos os eventos. Aceita filtros opcionais por data.

**Auth:** Nenhuma (endpoint público)

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `startDate` | string (ISO 8601) | Não | Retorna eventos com `endTime >= startDate` |
| `endDate` | string (ISO 8601) | Não | Retorna eventos com `startTime <= endDate` |

**Exemplo:**
```
GET https://apiatlasunite.com.br/api/events?startDate=2026-04-01T00:00:00Z&endDate=2026-05-01T00:00:00Z
```

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "title": "Festival de Verão Atlas",
    "description": "Evento ao ar livre.",
    "coverPhoto": "https://...",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "startTime": "2026-04-15T18:00:00.000Z",
    "endTime": "2026-04-15T23:00:00.000Z",
    "creator": {
      "id": "uuid",
      "firstName": "Atlas",
      "lastName": "SuperAdmin",
      "photoUrl": null
    },
    "_count": {
      "confirmations": 42
    }
  }
]
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `400` | Parâmetros de filtro inválidos |

---

### 3.3 Listar Meus Eventos (Super Admin)

### `GET https://apiatlasunite.com.br/api/events/my-events`

Retorna apenas os eventos criados pelo super admin autenticado.

**Auth:** Bearer Token **[SUPER_ADMIN]**

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "title": "Festival de Verão Atlas",
    "description": "...",
    "coverPhoto": "https://...",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "startTime": "2026-04-15T18:00:00.000Z",
    "endTime": "2026-04-15T23:00:00.000Z",
    "createdAt": "2026-03-28T10:00:00.000Z",
    "_count": {
      "confirmations": 42
    }
  }
]
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `401` | Token inválido ou ausente |
| `403` | `"Access denied. Super Admin privileges required."` |

---

### 3.4 Buscar Evento por ID

### `GET https://apiatlasunite.com.br/api/events/:id`

Retorna os detalhes de um evento específico.

**Auth:** Nenhuma (público)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do evento |

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "title": "Festival de Verão Atlas",
  "description": "Evento ao ar livre.",
  "coverPhoto": "https://...",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "startTime": "2026-04-15T18:00:00.000Z",
  "endTime": "2026-04-15T23:00:00.000Z",
  "createdAt": "2026-03-28T10:00:00.000Z",
  "updatedAt": "2026-03-28T10:00:00.000Z",
  "creator": {
    "id": "uuid",
    "firstName": "Atlas",
    "lastName": "SuperAdmin",
    "photoUrl": null
  },
  "_count": {
    "confirmations": 42
  }
}
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `404` | `"Event not found"` |

---

### 3.5 Buscar Eventos por Proximidade

### `GET https://apiatlasunite.com.br/api/events/nearby`

Retorna eventos dentro de um raio geográfico, ordenados por distância.

**Auth:** Nenhuma (público) — Token opcional para ampliar raio via plano PREMIUM

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `latitude` | number | Sim | Latitude do centro (-90 a 90) |
| `longitude` | number | Sim | Longitude do centro (-180 a 180) |
| `radius` | number | Não | Raio em **metros** (padrão: 10000) |
| `page` | number | Não | Página (padrão: 1) |
| `limit` | number | Não | Itens por página (padrão: 20) |

**Regras de raio por autenticação:**

| Situação | Raios permitidos |
|----------|-----------------|
| Não autenticado | Até 10km (10000m) |
| Autenticado — plano FREE | 2km, 5km, 10km |
| Autenticado — plano PREMIUM | 2km, 5km, 10km, 15km, 20km, 25km, 30km |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Festival de Verão Atlas",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "startTime": "2026-04-15T18:00:00.000Z",
      "endTime": "2026-04-15T23:00:00.000Z",
      "distance": 1245.67,
      "distanceKm": "1.25",
      "creator": {
        "id": "uuid",
        "firstName": "Atlas",
        "lastName": "SuperAdmin",
        "photoUrl": null
      },
      "confirmationsCount": 42,
      "isConfirmed": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "hasMore": false
  }
}
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `400` | Coordenadas inválidas |
| `403` | `"Radius exceeds plan limits"` + campo `suggestion` com os raios permitidos |

---

### 3.6 Atualizar Evento

### `PATCH https://apiatlasunite.com.br/api/events/:id`

Atualiza parcialmente um evento existente.

**Auth:** Bearer Token **[SUPER_ADMIN]**
**Content-Type:** `multipart/form-data` ou `application/json`

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do evento |

**Request Body (todos os campos são opcionais):**
| Campo | Tipo | Validação |
|-------|------|-----------|
| `title` | string | Entre 3 e 100 caracteres |
| `description` | string | Máximo 500 caracteres |
| `coverPhoto` | file (upload) ou string (URL) | Imagem ou URL válida |
| `latitude` | number | Entre -90 e 90 |
| `longitude` | number | Entre -180 e 180 |
| `startTime` | string (ISO 8601) | Data futura |
| `endTime` | string (ISO 8601) | Posterior a `startTime` |

**Exemplo:**
```json
{
  "title": "Festival de Verão Atlas — Edição Especial",
  "endTime": "2026-04-16T01:00:00.000Z"
}
```

**Response `200 OK`:**
```json
{
  "id": "uuid",
  "title": "Festival de Verão Atlas — Edição Especial",
  "description": "Evento ao ar livre.",
  "coverPhoto": "https://...",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "startTime": "2026-04-15T18:00:00.000Z",
  "endTime": "2026-04-16T01:00:00.000Z",
  "updatedAt": "2026-03-28T11:00:00.000Z"
}
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `400` | Campos inválidos |
| `401` | Token inválido ou ausente |
| `403` | `"Access denied"` ou `"Only the event creator can update the event"` |
| `404` | `"Event not found"` |

---

### 3.7 Deletar Evento

### `DELETE https://apiatlasunite.com.br/api/events/:id`

Remove um evento e todos os seus dados associados (confirmações).

**Auth:** Bearer Token **[SUPER_ADMIN]**

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do evento |

**Response `204 No Content`** — Sem corpo de resposta.

**Errors:**
| Status | Mensagem |
|--------|----------|
| `401` | Token inválido ou ausente |
| `403` | `"Access denied"` ou `"Only the event creator can delete the event"` |
| `404` | `"Event not found"` |

---

### 3.8 Listar Confirmações de Presença

### `GET https://apiatlasunite.com.br/api/events/:id/confirmations`

Retorna a lista de usuários que confirmaram presença no evento.

**Auth:** Nenhuma (público)

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do evento |

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "confirmedAt": "2026-03-28T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "firstName": "João",
      "lastName": "Silva",
      "photoUrl": "https://..."
    }
  }
]
```

**Errors:**
| Status | Mensagem |
|--------|----------|
| `404` | `"Event not found"` |

---

## 4. Fluxo de Autenticação na Plataforma

```
1. POST https://apiatlasunite.com.br/api/auth/login
   Body: { email, password }
   → Retorna { token, user }

2. Armazenar token no frontend

3. Todas as requisições de escrita:
   Header: Authorization: Bearer <token>

4. O token não expira. Para revogar acesso:
   → Alterar SUPER_ADMIN_PASSWORD no .env e reiniciar a API
   → Isso invalida todos os tokens emitidos anteriormente
```

---

## 5. Erros Comuns de Autenticação

| Status | Mensagem | Causa |
|--------|----------|-------|
| `401` | `"No token provided"` | Header `Authorization` ausente |
| `401` | `"Token malformatted"` | Header não segue formato `Bearer <token>` |
| `401` | `"Invalid token"` | Token inválido ou corrompido |
| `401` | `"User not found"` | Usuário removido após emissão do token |
| `403` | `"Access denied. Super Admin privileges required."` | Usuário autenticado não é SUPER_ADMIN |

---

## 6. Resumo dos Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `POST` | `https://apiatlasunite.com.br/api/auth/login` | Nenhuma | Login do super admin |
| `GET` | `https://apiatlasunite.com.br/api/auth/profile` | Bearer | Perfil do usuário autenticado |
| `POST` | `https://apiatlasunite.com.br/api/events` | Bearer [SUPER_ADMIN] | Criar evento |
| `GET` | `https://apiatlasunite.com.br/api/events` | Nenhuma | Listar todos os eventos |
| `GET` | `https://apiatlasunite.com.br/api/events/my-events` | Bearer [SUPER_ADMIN] | Listar eventos do admin |
| `GET` | `https://apiatlasunite.com.br/api/events/nearby` | Opcional | Buscar eventos por proximidade |
| `GET` | `https://apiatlasunite.com.br/api/events/:id` | Nenhuma | Detalhes de um evento |
| `PATCH` | `https://apiatlasunite.com.br/api/events/:id` | Bearer [SUPER_ADMIN] | Atualizar evento |
| `DELETE` | `https://apiatlasunite.com.br/api/events/:id` | Bearer [SUPER_ADMIN] | Deletar evento |
| `GET` | `https://apiatlasunite.com.br/api/events/:id/confirmations` | Nenhuma | Confirmações de presença |
