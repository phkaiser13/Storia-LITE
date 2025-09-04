# Guia: Gerenciamento de Itens e Inventário

Este guia aborda todas as operações relacionadas ao gerenciamento de itens em seu inventário no StorIA-LITE. Os itens são as entidades centrais que representam os produtos, materiais ou ativos que você deseja rastrear.

Todos os endpoints neste guia requerem autenticação. Você deve incluir um JWT válido no cabeçalho `Authorization`.

## 1. O Modelo de Dados do Item

Um `Item` no StorIA-LITE possui as seguintes propriedades:

| Campo           | Tipo     | Descrição                                                                   |
|-----------------|----------|-----------------------------------------------------------------------------|
| `id`            | Guid     | O identificador único para o item.                                          |
| `name`          | string   | O nome do item (ex: "Capacete de Segurança V-Gard").                        |
| `sku`           | string   | A Unidade de Manutenção de Estoque (SKU). Deve ser único entre todos os itens. |
| `description`   | string   | Uma descrição detalhada do item.                                            |
| `category`      | string   | A categoria à qual o item pertence (ex: "EPI", "Ferramenta Manual").        |
| `stockQuantity` | integer  | A quantidade atual do item em estoque. Este campo é somente leitura na maioria dos DTOs. |
| `expiryDate`    | DateTime | A data de validade do item. Pode ser nulo para bens não perecíveis.         |
| `createdAt`     | DateTime | O timestamp de quando o item foi criado.                                    |
| `updatedAt`     | DateTime | O timestamp da última atualização.                                          |

---

## 2. Criando um Novo Item

Para adicionar um novo item ao inventário, você envia uma requisição para o endpoint `POST /api/Items`.

*   **Autorização**: Requer a função `Almoxarife` ou `RH`.

### Corpo da Requisição

| Campo           | Tipo    | Descrição                                         | Obrigatório |
|-----------------|---------|-----------------------------------------------------|-------------|
| `name`          | string  | O nome do item.                                   | Sim         |
| `sku`           | string  | O SKU único para o item.                          | Sim         |
| `description`   | string  | Uma descrição para o item.                        | Sim         |
| `category`      | string  | A categoria do item.                              | Sim         |
| `initialQuantity`| integer | A quantidade inicial para o item.                 | Sim         |
| `expiryDate`    | DateTime| A data de validade, se aplicável.                 | Não         |

### Exemplo de Requisição

```http
POST /api/Items
Content-Type: application/json
Authorization: Bearer <seu_token_jwt>

{
  "name": "Máscara Respiratória 3M N95",
  "sku": "3M-N95-8210",
  "description": "Respirador padrão N95 para poeira e partículas.",
  "category": "EPI",
  "initialQuantity": 500,
  "expiryDate": "2025-12-31T00:00:00Z"
}
```

### Resposta

Uma criação bem-sucedida retorna um status `201 Created` com o `ItemDto` completo do item recém-criado.

---

## 3. Recuperando Itens

Você pode recuperar um único item por seu ID ou uma lista paginada de todos os itens.

### Obter Item por ID

*   **Endpoint**: `GET /api/Items/{id}`
*   **Descrição**: Recupera um único item por seu identificador único.
*   **Resposta**: Um objeto `ItemDto`.

### Obter Todos os Itens (Paginado)

*   **Endpoint**: `GET /api/Items`
*   **Descrição**: Recupera uma lista de itens com suporte para paginação, busca e ordenação.
*   **Parâmetros de Consulta**:
    *   `pageNumber` (integer, padrão: 1): O número da página a ser recuperada.
    *   `pageSize` (integer, padrão: 10): O número de itens por página.
    *   `searchTerm` (string): Um termo de busca para filtrar itens por nome, SKU ou categoria.
    *   `sortBy` (string, ex: "name"): O campo pelo qual ordenar.
    *   `sortOrder` (string, "asc" ou "desc"): A ordem de classificação.

### Exemplo de Requisição (Obter Todos)

`GET /api/Items?pageNumber=1&pageSize=20&searchTerm=Respirador&sortBy=name&sortOrder=asc`

### Resposta (Obter Todos)

A resposta é um objeto `PagedResult` contendo a lista de itens e metadados de paginação.

```json
{
  "items": [
    {
      "id": "...",
      "name": "Máscara Respiratória 3M N95",
      "sku": "3M-N95-8210",
      ...
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

## 4. Atualizando um Item

Para atualizar os detalhes de um item existente, envie uma requisição `PUT` para `/api/Items/{id}`.

*   **Autorização**: Requer a função `Almoxarife` ou `RH`.

### Corpo da Requisição

Você só precisa incluir os campos que deseja atualizar.

| Campo         | Tipo    | Descrição                     | Obrigatório |
|---------------|---------|---------------------------------|-------------|
| `name`        | string  | O novo nome para o item.      | Não         |
| `description` | string  | A nova descrição.             | Não         |
| `category`    | string  | A nova categoria.             | Não         |
| `expiryDate`  | DateTime| A nova data de validade.      | Não         |

**Nota**: Você não pode atualizar o `sku` ou a `stockQuantity` diretamente por este endpoint. A quantidade em estoque é gerenciada através do sistema de [Rastreamento de Movimentação](./03-movement-tracking.md).

### Exemplo de Requisição

```http
PUT /api/Items/a1b2c3d4-e5f6...
Content-Type: application/json
Authorization: Bearer <seu_token_jwt>

{
  "description": "Respirador padrão N95 para poeira e partículas suspensas. Pacote com 20.",
  "category": "Equipamento de Segurança"
}
```

### Resposta

Uma atualização bem-sucedida retorna um código de status `204 No Content`.

---

## 5. Excluindo um Item

Para excluir um item, envie uma requisição `DELETE` para `/api/Items/{id}`.

*   **Autorização**: Requer a função `RH`.

### Regra de Negócio

Um item **não pode ser excluído** se tiver qualquer histórico de movimentação associado a ele. Esta é uma regra de negócio crítica para manter a integridade dos dados e uma trilha de auditoria completa. Se você tentar excluir um item que já teve entrada ou saída, a API retornará um erro `409 Conflict`.

### Resposta

*   **`204 No Content`**: Se a exclusão foi bem-sucedida.
*   **`404 Not Found`**: Se o item com o ID especificado não existe.
*   **`409 Conflict`**: Se o item não pode ser excluído devido ao seu histórico de movimentação.
