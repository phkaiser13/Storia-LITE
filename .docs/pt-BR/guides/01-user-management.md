# Guia: Gerenciamento de Usuários

Este guia fornece uma visão geral completa das funcionalidades de gerenciamento de usuários no StorIA-LITE. Ele cobre o registro de usuários, autenticação, funções e gerenciamento de perfil.

## 1. Registro de Usuário

Criar uma conta de usuário é o primeiro passo para interagir com o sistema StorIA-LITE. O registro é tratado pelo endpoint `POST /api/Auth/register`.

### Corpo da Requisição

| Campo      | Tipo   | Descrição                                         | Obrigatório |
|------------|--------|-----------------------------------------------------|-------------|
| `fullName` | string | O nome completo do usuário.                         | Sim         |
| `email`    | string | O endereço de e-mail do usuário. Deve ser único.    | Sim         |
| `password` | string | A senha do usuário. Deve atender às regras de complexidade. | Sim         |
| `role`     | string | A função atribuída ao usuário. Veja as funções abaixo. | Sim         |

**Complexidade da Senha:**
A política de senha padrão requer:
* Pelo menos 8 caracteres
* Pelo menos uma letra maiúscula
* Pelo menos uma letra minúscula
* Pelo menos um número
* Pelo menos um caractere especial (ex: `!@#$%^&*`)

### Exemplo de Requisição

```http
POST /api/Auth/register
Content-Type: application/json

{
  "fullName": "João da Silva",
  "email": "joao.silva@example.com",
  "password": "Senha123!",
  "role": "Almoxarife"
}
```

### Resposta

Se o registro for bem-sucedido, a API retornará um código de status `201 Created` com os detalhes do usuário recém-criado (excluindo a senha).

```json
{
  "id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
  "fullName": "João da Silva",
  "email": "joao.silva@example.com",
  "role": "Almoxarife",
  "createdAt": "2023-10-27T10:00:00Z"
}
```

---

## 2. Funções de Usuário e Permissões

O StorIA-LITE usa um sistema de Controle de Acesso Baseado em Função (RBAC) para gerenciar permissões. Quando um usuário é criado, ele recebe uma única função que determina quais ações ele pode realizar.

As funções disponíveis são:

| Função       | Descrição                                                              | Permissões Chave                                                              |
|--------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Almoxarife** | A função de usuário padrão para tarefas diárias de inventário.         | Criar Itens, Ler Itens, Atualizar Itens, Registrar Movimentações.             |
| **Gestor**   | Uma função com permissões mais amplas, incluindo relatórios e visualização. | Todas as permissões de `Almoxarife`, mais acesso a painéis e relatórios.      |
| **RH**       | (Recursos Humanos) Uma função administrativa com capacidades de gerenciamento de usuários. | Todas as permissões de `Gestor`, mais Criar Usuários, Atualizar Usuários e Excluir Itens. |

As permissões são aplicadas no nível do endpoint da API usando atributos `[Authorize(Roles = "...")]`. Por exemplo, a exclusão de um item requer a função `RH`.

---

## 3. Autenticação (Login)

Depois que um usuário é registrado, ele pode se autenticar enviando suas credenciais para o endpoint `POST /api/Auth/login`.

### Corpo da Requisição

| Campo      | Tipo   | Descrição                   | Obrigatório |
|------------|--------|-------------------------------|-------------|
| `email`    | string | O endereço de e-mail do usuário. | Sim         |
| `password` | string | A senha do usuário.           | Sim         |

### Exemplo de Requisição

```http
POST /api/Auth/login
Content-Type: application/json

{
  "email": "joao.silva@example.com",
  "password": "Senha123!"
}
```

### Resposta

Um login bem-sucedido retornará um código de status `200 OK` e um corpo de resposta contendo um **JSON Web Token (JWT)**.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...",
  "expires": "2023-10-27T11:00:00Z",
  "user": {
    "id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
    "fullName": "João da Silva",
    "email": "joao.silva@example.com",
    "role": "Almoxarife"
  }
}
```

Este `token` deve ser incluído no cabeçalho `Authorization` para todas as requisições subsequentes a endpoints protegidos.

**Formato do Cabeçalho:** `Authorization: Bearer <seu_token_jwt>`

---

## 4. Gerenciamento de Perfil

Usuários autenticados podem gerenciar seus próprios perfis.

### Visualizar Perfil

*   **Endpoint**: `GET /api/Users/profile`
*   **Descrição**: Recupera as informações de perfil do usuário atualmente autenticado.
*   **Resposta**: Um objeto `UserDto` contendo os detalhes do usuário.

### Atualizar Perfil

*   **Endpoint**: `PUT /api/Users/profile`
*   **Descrição**: Atualiza as informações de perfil do usuário atualmente autenticado.
*   **Corpo da Requisição**:
    ```json
    {
      "fullName": "João A. da Silva",
      "email": "joao.silva.novo@example.com"
    }
    ```
*   **Resposta**: `204 No Content` em caso de sucesso.

### Alterar Senha

*   **Endpoint**: `POST /api/Users/change-password`
*   **Descrição**: Permite que um usuário autenticado altere sua própria senha.
*   **Corpo da Requisição**:
    ```json
    {
      "currentPassword": "Senha123!",
      "newPassword": "NovaSenha456!"
    }
    ```
*   **Resposta**: `204 No Content` em caso de sucesso.
