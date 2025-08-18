# Referência da API: MovementsController

**Rota do Controlador**: `/api/Movements`

Este controlador é responsável por criar e recuperar registros de movimentação de estoque. As movimentações são a base da trilha de auditoria do inventário.

---

## 1. Registrar Movimentação

Cria um novo registro de movimentação de estoque, que por sua vez atualiza a `stockQuantity` do item associado.

*   **Endpoint**: `POST /`
*   **Permissões**: Requer a função `Almoxarife` ou `RH`.

### Corpo da Requisição (`RegisterMovementRequestDto`)

```json
{
  "itemId": "guid",
  "userId": "guid",
  "quantity": 0,
  "type": "string",
  "reason": "string"
}
```

| Campo      | Tipo    | Restrições      | Descrição                                                              |
|------------|---------|-----------------|------------------------------------------------------------------------|
| `itemId`   | Guid    | Obrigatório     | O ID único do item que está sendo movido.                              |
| `userId`   | Guid    | Obrigatório     | O ID do usuário responsável pela movimentação.                         |
| `quantity` | integer | Obrigatório, > 0| O número de itens movidos. Deve ser um inteiro positivo.               |
| `type`     | string  | Obrigatório     | O tipo de movimentação: `Entrada` ou `Saida`.                          |
| `reason`   | string  | Opcional        | Uma nota opcional descrevendo o motivo da movimentação.                |

### Respostas

*   **`201 Created`**: A movimentação foi registrada com sucesso. O corpo da resposta contém o novo `MovementDto`.
*   **`400 Bad Request`**: A requisição é inválida. Isso pode ocorrer devido a:
    *   Campos ausentes ou inválidos.
    *   Um `itemId` ou `userId` inválido.
    *   Tentativa de uma movimentação de `Saida` com uma quantidade maior que o estoque disponível (`Estoque insuficiente...`).
*   **`401 Unauthorized`**: O usuário não está autenticado.
*   **`403 Forbidden`**: O usuário autenticado não tem a função necessária.

---

## 2. Obter Todas as Movimentações

Recupera uma lista paginada de todas as movimentações de estoque, com poderosas capacidades de filtragem.

*   **Endpoint**: `GET /`
*   **Permissões**: Requer autenticação.

### Parâmetros de Consulta

| Parâmetro      | Tipo     | Descrição                                                          |
|----------------|----------|--------------------------------------------------------------------|
| `pageNumber`   | integer  | O número da página a ser recuperada (padrão: 1).                   |
| `pageSize`     | integer  | O número de movimentações por página (padrão: 10).                 |
| `itemId`       | Guid     | Filtra as movimentações para um único item.                        |
| `userId`       | Guid     | Filtra as movimentações realizadas por um único usuário.           |
| `startDate`    | DateTime | Filtra para movimentações a partir desta data (inclusivo).         |
| `endDate`      | DateTime | Filtra para movimentações até esta data (inclusivo).               |

### Respostas

*   **`200 OK`**: Retorna um objeto `PagedResult<MovementDto>` contendo os registros de movimentação e os metadados de paginação.
    ```json
    {
      "items": [
        {
          "id": "guid",
          "quantity": 0,
          "movementDate": "date-time",
          "type": "string",
          "reason": "string",
          "item": {
            "id": "guid",
            "name": "string",
            "sku": "string"
          },
          "user": {
            "id": "guid",
            "fullName": "string"
          }
        }
      ],
      "totalCount": 0,
      "pageNumber": 0,
      "pageSize": 0,
      "totalPages": 0,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
    ```
*   **`401 Unauthorized`**: O usuário não está autenticado.
