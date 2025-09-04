# Guia: Rastreamento de Movimentação e Controle de Estoque

O rastreamento de movimentações está no coração do sistema de controle de inventário do StorIA-LITE. Cada mudança na quantidade de estoque de um item é registrada como uma "Movimentação". Isso cria um histórico completo e auditável de todos os itens, mostrando quem os moveu, quando e por quê.

Todos os endpoints neste guia requerem autenticação.

## 1. Entendendo as Movimentações

Existem dois tipos fundamentais de movimentações:

*   **`Entrada`**: Representa um aumento no estoque. Isso ocorre quando novos itens são recebidos, devolvidos ao armazém ou uma contagem inicial de estoque é registrada. Uma movimentação de `Entrada` **aumenta** a `stockQuantity` do item associado.
*   **`Saida`**: Representa uma diminuição no estoque. Isso ocorre quando os itens são entregues a uma pessoa ou projeto, vendidos ou descartados. Uma movimentação de `Saida` **diminui** a `stockQuantity` do item associado.

Um registro de `Movement` (Movimentação) vincula um `Item`, um `User` (Usuário) e uma `quantity` (quantidade) em um ponto específico no tempo.

## 2. Registrando uma Nova Movimentação

Para registrar uma movimentação de estoque, você envia uma requisição para o endpoint `POST /api/Movements`. O serviço da aplicação irá então atualizar automaticamente a `stockQuantity` do item correspondente.

*   **Autorização**: Requer a função `Almoxarife` ou `RH`.

### Corpo da Requisição

| Campo      | Tipo    | Descrição                                                                 | Obrigatório |
|------------|---------|---------------------------------------------------------------------------|-------------|
| `itemId`   | Guid    | O identificador único do item que está sendo movido.                      | Sim         |
| `userId`   | Guid    | O ID do usuário responsável pela movimentação.                            | Sim         |
| `quantity` | integer | O número de itens que estão sendo movidos. Deve ser um inteiro positivo.  | Sim         |
| `type`     | string  | O tipo de movimentação. Deve ser `Entrada` ou `Saida`.                    | Sim         |
| `reason`   | string  | Um motivo ou nota opcional para a movimentação (ex: "Recebido do fornecedor X"). | Não         |

### Exemplo de Requisição (Entrada de Estoque)

```http
POST /api/Movements
Content-Type: application/json
Authorization: Bearer <seu_token_jwt>

{
  "itemId": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
  "userId": "f0e9d8c7-b6a5-f4e3-d2c1-b0a9f8e7d6c5",
  "quantity": 50,
  "type": "Entrada",
  "reason": "Reposição trimestral de estoque"
}
```

### Regras de Negócio e Respostas

*   **Movimentação Bem-Sucedida**: Retorna um status `201 Created` com os detalhes do novo `MovementDto`. A `stockQuantity` do item com ID `a1b2c3d4-...` será aumentada em 50.
*   **Estoque Insuficiente**: Se você tentar registrar uma movimentação de `Saida` para uma quantidade maior que a `stockQuantity` atual do item, a API retornará um `400 Bad Request` com uma mensagem de erro como "Estoque insuficiente para realizar a retirada."
*   **Item/Usuário Inválido**: Se o `itemId` ou `userId` não existir, a API retornará um `400 Bad Request`.

---

## 3. Recuperando Histórico de Movimentações

Você pode recuperar uma lista paginada de todas as movimentações, que pode ser filtrada para ver o histórico de um item específico, usuário ou período de tempo.

*   **Endpoint**: `GET /api/Movements`
*   **Descrição**: Recupera uma lista de todas as movimentações com suporte para paginação e filtragem.
*   **Parâmetros de Consulta**:
    *   `pageNumber` (integer, padrão: 1): O número da página a ser recuperada.
    *   `pageSize` (integer, padrão: 10): O número de itens por página.
    *   `itemId` (Guid): Filtra o histórico para um item específico.
    *   `userId` (Guid): Filtra o histórico para um usuário específico.
    *   `startDate` (DateTime): Filtra movimentações a partir desta data.
    *   `endDate` (DateTime): Filtra movimentações até esta data.

### Exemplo de Requisição

Para obter o histórico de movimentações de um item específico durante o mês de outubro de 2023:
`GET /api/Movements?itemId=a1b2c3d4-...&startDate=2023-10-01&endDate=2023-10-31`

### Resposta

A resposta é um objeto `PagedResult` contendo a lista de movimentações e metadados de paginação. Cada movimentação na lista fornece detalhes completos, incluindo as informações do item e do usuário associados.

```json
{
  "items": [
    {
      "id": "m1v2c3d4-...",
      "quantity": 50,
      "movementDate": "2023-10-15T14:30:00Z",
      "type": "Entrada",
      "reason": "Reposição trimestral de estoque",
      "item": {
        "id": "a1b2c3d4-...",
        "name": "Máscara Respiratória 3M N95",
        "sku": "3M-N95-8210"
      },
      "user": {
        "id": "f0e9d8c7-...",
        "fullName": "Joana da Silva"
      }
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 10,
  ...
}
```
