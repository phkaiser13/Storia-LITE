# Referência da API: AuthController

**Rota do Controlador**: `/api/Auth`

Este controlador lida com a autenticação e o registro de usuários.

---

## 1. Registrar Usuário

Cria uma nova conta de usuário.

*   **Endpoint**: `POST /register`
*   **Descrição**: Registra um novo usuário com uma função especificada. O endereço de e-mail deve ser único.
*   **Permissões**: Público (Nenhuma autenticação necessária).

### Corpo da Requisição

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}
```

| Campo      | Tipo   | Restrições        | Descrição                                         |
|------------|--------|-------------------|-----------------------------------------------------|
| `fullName` | string | Obrigatório       | O nome completo do usuário.                         |
| `email`    | string | Obrigatório, Único| O endereço de e-mail do usuário.                    |
| `password` | string | Obrigatório, Complexa | A senha do usuário.                               |
| `role`     | string | Obrigatório       | A função do usuário (ex: `Almoxarife`, `RH`).       |

### Respostas

*   **`201 Created`**: O usuário foi criado com sucesso. O corpo da resposta contém o `UserDto`.
    ```json
    {
      "id": "guid",
      "fullName": "string",
      "email": "string",
      "role": "string",
      "createdAt": "date-time"
    }
    ```
*   **`400 Bad Request`**: A requisição é inválida (ex: campos ausentes, senha muito fraca). O corpo da resposta contém erros de validação.
*   **`409 Conflict`**: Já existe uma conta com o e-mail fornecido.

---

## 2. Login de Usuário

Autentica um usuário e retorna um JSON Web Token (JWT).

*   **Endpoint**: `POST /login`
*   **Descrição**: Valida as credenciais do usuário e emite um JWT para acessar recursos protegidos.
*   **Permissões**: Público (Nenhuma autenticação necessária).

### Corpo da Requisição

```json
{
  "email": "string",
  "password": "string"
}
```

| Campo      | Tipo   | Restrições  | Descrição                   |
|------------|--------|-------------|-------------------------------|
| `email`    | string | Obrigatório | O endereço de e-mail do usuário. |
| `password` | string | Obrigatório | A senha do usuário.           |

### Respostas

*   **`200 OK`**: O login foi bem-sucedido. O corpo da resposta contém o `AuthResultDto`.
    ```json
    {
      "token": "string",
      "expires": "date-time",
      "user": {
        "id": "guid",
        "fullName": "string",
        "email": "string",
        "role": "string"
      }
    }
    ```
*   **`401 Unauthorized`**: Credenciais inválidas (e-mail ou senha estão incorretos).
*   **`400 Bad Request`**: A requisição é inválida.

---

## 3. Atualizar Token (Implementação Futura)

*   **Endpoint**: `POST /refresh-token`
*   **Descrição**: Este endpoint está reservado para uma melhoria futura para permitir que os clientes atualizem um JWT expirado usando um token de atualização, melhorando a segurança e a experiência do usuário.
*   **Status**: Ainda não implementado.
