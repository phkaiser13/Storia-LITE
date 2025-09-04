# Referência da API: ItemsController

**Rota do Controlador**: `/api/Items`

Este controlador gerencia todas as operações CRUD (Criar, Ler, Atualizar, Excluir) para itens de inventário. Todos os endpoints sob este controlador requerem autenticação.

---

## 1. Criar Item

Cria um novo item de inventário.

*   **Endpoint**: `POST /`
*   **Permissões**: Requer a função `Almoxarife` ou `RH`.

### Corpo da Requisição (`CreateItemRequestDto`)

```json
{
  "name": "string",
  "sku": "string",
  "description": "string",
  "category": "string",
  "initialQuantity": 0,
  "expiryDate": "date-time"
}
```

### Respostas

*   **`201 Created`**: O item foi criado com sucesso. O corpo da resposta contém o `ItemDto` recém-criado.
*   **`400 Bad Request`**: A requisição é inválida (ex: campos obrigatórios ausentes, tipos de dados inválidos).
*   **`409 Conflict`**: Já existe um item com o mesmo `sku`.
*   **`401 Unauthorized`**: O usuário não está autenticado.
*   **`403 Forbidden`**: O usuário autenticado não tem a função necessária.

---

## 2. Obter Item por ID

Recupera um único item pelo seu identificador único.

*   **Endpoint**: `GET /{id}`
*   **Permissões**: Requer autenticação.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição                     |
|-----------|------|-------------------------------|
| `id`      | Guid | O ID único do item.           |

### Respostas

*   **`200 OK`**: O item foi encontrado. O corpo da resposta contém o `ItemDto`.
*   **`404 Not Found`**: Um item com o `id` especificado não foi encontrado.
*   **`401 Unauthorized`**: O usuário não está autenticado.

---

## 3. Obter Todos os Itens

Recupera uma lista paginada de todos os itens do inventário.

*   **Endpoint**: `GET /`
*   **Permissões**: Requer autenticação.

### Parâmetros de Consulta

| Parâmetro      | Tipo    | Descrição                                                       |
|----------------|---------|-------------------------------------------------------------------|
| `pageNumber`   | integer | O número da página a ser recuperada (padrão: 1).                  |
| `pageSize`     | integer | O número de itens por página (padrão: 10).                      |
| `searchTerm`   | string  | Um termo para filtrar itens por nome, SKU ou categoria.          |
| `sortBy`       | string  | O campo para ordenação (ex: "name", "sku", "createdAt").        |
| `sortOrder`    | string  | A direção da ordenação ("asc" ou "desc").                         |

### Respostas

*   **`200 OK`**: Retorna um objeto `PagedResult<ItemDto>` contendo os itens e os metadados de paginação.
*   **`401 Unauthorized`**: O usuário não está autenticado.

---

## 4. Atualizar Item

Atualiza os detalhes de um item existente.

*   **Endpoint**: `PUT /{id}`
*   **Permissões**: Requer a função `Almoxarife` ou `RH`.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição                               |
|-----------|------|-----------------------------------------|
| `id`      | Guid | O ID único do item a ser atualizado.    |

### Corpo da Requisição (`UpdateItemRequestDto`)

```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "expiryDate": "date-time"
}
```
**Nota**: Inclua apenas os campos que deseja atualizar. O `sku` e a `stockQuantity` não podem ser atualizados através deste endpoint.

### Respostas

*   **`204 No Content`**: A atualização foi bem-sucedida.
*   **`404 Not Found`**: Um item com o `id` especificado não foi encontrado.
*   **`400 Bad Request`**: O corpo da requisição é inválido.
*   **`401 Unauthorized`**: O usuário não está autenticado.
*   **`403 Forbidden`**: O usuário autenticado não tem a função necessária.

---

## 5. Excluir Item

Exclui um item do inventário.

*   **Endpoint**: `DELETE /{id}`
*   **Permissões**: Requer a função `RH`.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição                             |
|-----------|------|---------------------------------------|
| `id`      | Guid | O ID único do item a ser excluído.    |

### Respostas

*   **`204 No Content`**: O item foi excluído com sucesso.
*   **`404 Not Found`**: Um item com o `id` especificado não foi encontrado.
*   **`409 Conflict`**: O item não pode ser excluído porque possui um histórico de movimentações associado.
*   **`401 Unauthorized`**: O usuário não está autenticado.
*   **`403 Forbidden`**: O usuário autenticado não tem a função necessária.
