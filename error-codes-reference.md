# Atlas API — Referência de Erros (Super Admin + Eventos)

Documento para mapeamento e tratamento de erros no frontend da plataforma web do Super Admin.

**Formato padrão de todas as respostas de erro:**
```json
{ "error": "mensagem do erro" }
```

**Exceções com campos adicionais** estão indicadas em cada entrada.

---

## Sumário por Status Code

| Status | Significado geral |
|--------|------------------|
| `400` | Dados inválidos, campos faltando ou regra de negócio violada |
| `401` | Não autenticado — token ausente, inválido ou usuário não encontrado |
| `403` | Autenticado mas sem permissão para a ação |
| `404` | Recurso não encontrado |
| `429` | Rate limit atingido |
| `500` | Erro interno inesperado no servidor |

---

## 1. Autenticação e Middleware

### 1.1 `authMiddleware` — Validação do Token JWT

Aplicado em todas as rotas protegidas antes de qualquer lógica de negócio.

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | `"No token provided"` | Header `Authorization` ausente na requisição |
| `401` | `"Token error"` | Header `Authorization` não segue o formato `Bearer <token>` |
| `401` | `"Token malformatted"` | Scheme do token não é `Bearer` |
| `401` | `"Invalid token"` | Token com assinatura inválida ou corrompido |

---

### 1.2 `superAdminMiddleware` — Verificação de Papel

Executado após `authMiddleware` nas rotas de criação, edição e exclusão de eventos.

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | `"Authentication required"` | `userId` não foi injetado pelo `authMiddleware` |
| `401` | `"User not found"` | Token válido, mas o usuário foi removido do banco |
| `403` | `"Access denied. Super Admin privileges required."` | Usuário autenticado não tem `role = SUPER_ADMIN` |
| `500` | `"Authorization check failed"` | Erro inesperado ao consultar o banco durante a verificação de papel |

---

### 1.3 `POST /auth/login` — Login

| Status | `error` | Causa |
|--------|---------|-------|
| `400` | `"Invalid email address"` | Campo `email` com formato inválido (Zod) |
| `400` | `"Password is required"` | Campo `password` vazio ou ausente (Zod) |
| `401` | `"Invalid credentials"` | Email não encontrado ou senha incorreta |
| `429` | `"Too many failed authentication attempts. Please try again in 15 minutes."` | Mais de 20 tentativas em 15 minutos — campo adicional: `retryAfter: 900` |

---

### 1.4 `GET /auth/profile` — Perfil do usuário autenticado

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `404` | `"User not found"` | Usuário não existe no banco |

---

## 2. Eventos

### 2.1 `POST /events` — Criar evento

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `403` | `"Access denied. Super Admin privileges required."` | Usuário não é SUPER_ADMIN |
| `400` | `"Title must be at least 3 characters"` | `title` com menos de 3 caracteres (Zod) |
| `400` | `"Title must be at most 100 characters"` | `title` com mais de 100 caracteres (Zod) |
| `400` | `"Description must be at most 500 characters"` | `description` com mais de 500 caracteres (Zod) |
| `400` | `"Cover photo must be a valid URL"` | `coverPhoto` enviado como texto mas não é URL válida (Zod) |
| `400` | `"Invalid latitude. Must be between -90 and 90"` | `latitude` fora do intervalo (Service) |
| `400` | `"Invalid longitude. Must be between -180 and 180"` | `longitude` fora do intervalo (Service) |
| `400` | `"Event cannot start in the past"` | `startTime` anterior ao momento atual (Service) |
| `400` | `"End time must be after start time"` | `endTime` igual ou anterior a `startTime` (Service) |
| `429` | `"Too many requests, please try again later."` | Rate limit geral atingido — campo adicional: `retryAfter: 60` |

**Upload de imagem (`coverPhoto` como arquivo):**

| Status | `error` | Causa |
|--------|---------|-------|
| `400` | `"Invalid file type. Only JPEG, JPG, PNG and WEBP are allowed."` | Tipo de arquivo não suportado |
| `400` | *(sem mensagem explícita)* | Arquivo excede 5MB |

---

### 2.2 `PATCH /events/:id` — Atualizar evento

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `403` | `"Access denied. Super Admin privileges required."` | Usuário não é SUPER_ADMIN |
| `403` | `"Only the event creator can update the event"` | Super admin autenticado não é o criador do evento |
| `404` | `"Event not found"` | Evento com o `:id` informado não existe |
| `400` | `"Title must be at least 3 characters"` | `title` com menos de 3 caracteres (Zod) |
| `400` | `"Title must be at most 100 characters"` | `title` com mais de 100 caracteres (Zod) |
| `400` | `"Description must be at most 500 characters"` | `description` com mais de 500 caracteres (Zod) |
| `400` | `"Invalid latitude. Must be between -90 and 90"` | `latitude` fora do intervalo (Service) |
| `400` | `"Invalid longitude. Must be between -180 and 180"` | `longitude` fora do intervalo (Service) |
| `400` | `"Event cannot start in the past"` | `startTime` anterior ao momento atual (Service) |
| `400` | `"End time must be after start time"` | `endTime` igual ou anterior a `startTime` (Service) |

---

### 2.3 `DELETE /events/:id` — Deletar evento

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `403` | `"Access denied. Super Admin privileges required."` | Usuário não é SUPER_ADMIN |
| `403` | `"Only the event creator can delete the event"` | Super admin autenticado não é o criador do evento |
| `404` | `"Event not found"` | Evento com o `:id` informado não existe |

---

### 2.4 `GET /events` — Listar todos os eventos

| Status | `error` | Causa |
|--------|---------|-------|
| `400` | *(mensagem genérica do service)* | Parâmetros de filtro com formato inválido |

---

### 2.5 `GET /events/my-events` — Listar eventos do admin

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `403` | `"Access denied. Super Admin privileges required."` | Usuário não é SUPER_ADMIN |

---

### 2.6 `GET /events/:id` — Buscar evento por ID

| Status | `error` | Causa |
|--------|---------|-------|
| `404` | `"Event not found"` | Evento com o `:id` informado não existe |

---

### 2.7 `GET /events/nearby` — Buscar eventos por proximidade

| Status | `error` | Causa |
|--------|---------|-------|
| `400` | `"Latitude and longitude are required"` | Parâmetros `latitude` ou `longitude` ausentes |
| `400` | `"Invalid coordinates"` | Coordenadas fora do intervalo ou não numéricas |
| `403` | `"Para buscar eventos com range maior que 10km, faça login ou adquira o plano Premium."` | Usuário não autenticado solicitou raio > 10km — campo adicional: `suggestion: "Ranges disponíveis: 2km, 5km ou 10km"` |
| `403` | *(mensagem indicando limite do plano)* | Usuário FREE solicitou raio > 10km — campo adicional: `suggestion` com raios disponíveis |
| `403` | *(mensagem indicando limite do plano)* | Usuário PREMIUM solicitou raio > 30km — campo adicional: `suggestion` com raios disponíveis |

**Formato especial do `403` de raio:**
```json
{
  "error": "mensagem explicando o limite",
  "suggestion": "Ranges disponíveis: 2km, 5km, 10km, ..."
}
```

---

### 2.8 `GET /events/:id/confirmations` — Confirmações de presença

| Status | `error` | Causa |
|--------|---------|-------|
| `404` | `"Event not found"` | Evento com o `:id` informado não existe |

---

### 2.9 `POST /events/:id/confirm` — Confirmar presença

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `404` | `"Event not found"` | Evento com o `:id` informado não existe |
| `400` | `"Cannot confirm attendance to a past event"` | Evento já encerrado (`endTime` no passado) |
| `400` | `"You have already confirmed attendance to this event"` | Usuário já confirmou presença anteriormente |

---

### 2.10 `DELETE /events/:id/confirm` — Remover confirmação de presença

| Status | `error` | Causa |
|--------|---------|-------|
| `401` | *(erros do authMiddleware — ver 1.1)* | Token inválido ou ausente |
| `400` | `"You have not confirmed attendance to this event"` | Não existe confirmação para cancelar |

---

## 3. Rate Limiting — Visão Geral

Todas as respostas de rate limit incluem o campo adicional `retryAfter` (em segundos).

```json
{
  "error": "mensagem do rate limit",
  "retryAfter": 60
}
```

| Status | `error` | Aplica-se a | Limite | `retryAfter` |
|--------|---------|-------------|--------|--------------|
| `429` | `"Too many requests, please try again later."` | Todas as rotas (geral) | 100 req/min | `60` |
| `429` | `"Too many failed authentication attempts. Please try again in 15 minutes."` | `POST /auth/login` e `POST /auth/register` | 20 req/15min | `900` |

---

## 4. Erros de Servidor

| Status | `error` | Causa |
|--------|---------|-------|
| `500` | `"Internal server error"` | Erro inesperado sem mensagem estruturada |
| `500` | `"Authorization check failed"` | Falha inesperada no `superAdminMiddleware` ao consultar o banco |

> Erros `500` não devem ser exibidos diretamente ao usuário. Recomenda-se exibir uma mensagem genérica como "Ocorreu um erro inesperado. Tente novamente." e registrar o erro no sistema de monitoramento do frontend.

---

## 5. Guia de Tratamento por Fluxo

### Fluxo de Login
```
POST /auth/login
├── 400 → exibir mensagem de validação do campo
├── 401 → "E-mail ou senha incorretos"
└── 429 → "Muitas tentativas. Aguarde 15 minutos."
```

### Fluxo de Criação/Edição de Evento
```
POST /events ou PATCH /events/:id
├── 401 "No token provided"     → redirecionar para login
├── 401 "Invalid token"         → redirecionar para login
├── 401 "User not found"        → redirecionar para login
├── 403 "Access denied..."      → exibir "Sem permissão de acesso"
├── 403 "Only the event creator..."  → exibir "Você não é o criador deste evento"
├── 404                         → exibir "Evento não encontrado"
├── 400 (Zod)                   → exibir erro no campo correspondente do formulário
├── 400 (Service)               → exibir mensagem descritiva na tela
└── 429                         → desabilitar botão e exibir countdown
```

### Fluxo de Deleção de Evento
```
DELETE /events/:id
├── 401 → redirecionar para login
├── 403 → exibir "Sem permissão para deletar este evento"
├── 404 → exibir "Evento não encontrado" e remover da listagem
└── 500 → exibir erro genérico
```
