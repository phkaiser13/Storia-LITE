# StorIA-LITE: Sistema de Gestão de Inventário de Código Aberto

![Logo StorIA-LITE](https://raw.githubusercontent.com/Vytruve/storia-lite/main/assets/banner-storia-lite-dark.png)

[![Status da Build](https://img.shields.io/github/actions/workflow/status/Vytruve/storia-lite/dotnet.yml?style=for-the-badge)](https://github.com/Vytruve/storia-lite/actions)
[![Licença](https://img.shields.io/github/license/Vytruve/storia-lite?style=for-the-badge)](LICENSE)
[![Estrelas no GitHub](https://img.shields.io/github/stars/Vytruve/storia-lite?style=for-the-badge)](https://github.com/Vytruve/storia-lite/stargazers)
[![Issues no GitHub](https://img.shields.io/github/issues/Vytruve/storia-lite?style=for-the-badge)](https://github.com/Vytruve/storia-lite/issues)

**StorIA-LITE** é um sistema de gestão de inventário de código aberto, poderoso e flexível, projetado para trazer eficiência e clareza aos seus processos de controle de estoque. Construído com uma pilha de tecnologia moderna e uma arquitetura limpa e desacoplada, o StorIA-LITE é ideal para pequenas e médias empresas, armazéns e indivíduos que precisam de uma maneira confiável de rastrear itens, gerenciar movimentações e gerar relatórios perspicazes.

Este projeto é a versão "LITE" do sistema ERP/CRM mais abrangente StorIA, oferecendo funcionalidades essenciais de inventário em um pacote leve e acessível.

---

## 📖 Índice

- [Documentação Completa](#-documentação-completa)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Filosofia do Projeto](#-filosofia-do-projeto)
- [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
- [Pilha de Tecnologia](#-pilha-de-tecnologia)
- [Começando](#-começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Configuração](#configuração)
- [Executando a Aplicação](#-executando-a-aplicação)
  - [Executando a API de Backend](#executando-a-api-de-backend)
  - [Executando o Cliente Web](#executando-o-cliente-web)
- [Executando Testes](#-executando-testes)
- [Documentação da API](#-documentação-da-api)
- [Implantação (Deployment)](#-implantação-deployment)
- [Como Contribuir](#-como-contribuir)
- [Licença](#-licença)
- [Contato e Suporte](#-contato--suporte)

---

## 📚 Documentação Completa

Este README fornece uma visão geral do projeto. Para uma documentação mais detalhada e aprofundada, incluindo guias de funcionalidades, referências de API e tutoriais, por favor, visite nosso portal de documentação completa.

➡️ **[Explore a Documentação Completa](./docs/pt-BR/README.md)**

---

## ✨ Funcionalidades Principais

O StorIA-LITE oferece um conjunto robusto de funcionalidades para cobrir todas as necessidades essenciais de gerenciamento de inventário:

- **Gerenciamento de Itens**: Funcionalidade CRUD (Criar, Ler, Atualizar, Excluir) completa para seus itens de inventário. Rastreie SKUs, categorias, descrições, quantidades e até datas de validade.
- **Rastreamento de Movimentações**: Registre todas as movimentações de estoque, seja uma entrada (recebimento de mercadorias) ou uma saída (envio ou uso interno). Cada movimentação é registrada em nome de um usuário e de um item, fornecendo uma trilha de auditoria completa.
- **Gerenciamento de Usuários**: Sistema seguro de registro e autenticação de usuários com controle de acesso baseado em função (RBAC).
- **Autenticação**: Autenticação moderna baseada em JWT para proteger seus endpoints da API.
- **Painel de Análise (Dashboard)**: Um painel abrangente que fornece uma visão geral das principais métricas de inventário, como total de itens, níveis de estoque e movimentações recentes.
- **Relatórios**: Gere relatórios detalhados sobre o status do inventário, histórico de movimentações e muito mais, permitindo a tomada de decisões baseada em dados.
- **Pesquisa e Paginação**: Pesquise e navegue com eficiência por grandes conjuntos de itens and movimentações.

---

## 💡 Filosofia do Projeto

O desenvolvimento do StorIA-LITE é guiado por alguns princípios fundamentais:

1.  **Arquitetura Limpa (Clean Architecture)**: Seguimos estritamente os princípios da Arquitetura Limpa. Isso significa uma separação clara de responsabilidades entre as camadas de Domínio, Aplicação e Infraestrutura. Isso torna o sistema mais fácil de manter, testar e escalar.
2.  **Código Aberto**: Acreditamos no poder da comunidade. O StorIA-LITE é totalmente de código aberto sob a licença Apache-2.0, e damos as boas-vindas a contribuições de desenvolvedores de todos os lugares.
3.  **Tecnologia Moderna e Confiável**: O sistema é construído sobre o .NET 8, uma versão de suporte de longo prazo (LTS), garantindo estabilidade e acesso aos recursos mais recentes do C#. Usamos tecnologias comprovadas como PostgreSQL para o banco de dados e React para o frontend.
4.  **Extensibilidade**: Embora esta seja uma versão "LITE", ela foi construída com a extensibilidade em mente. A natureza desacoplada da arquitetura torna fácil adicionar novas funcionalidades ou integrar com outros sistemas.

---

## 🏗️ Visão Geral da Arquitetura

Para uma explicação detalhada da nossa arquitetura, incluindo diagramas e exemplos de fluxo de dados, por favor, veja a [**Documentação de Arquitetura**](./docs/pt-BR/architecture/README.md).

---

## 💻 Pilha de Tecnologia

### Backend

-   **Framework**: .NET 8 (C#)
-   **Banco de Dados**: PostgreSQL
-   **ORM**: Entity Framework Core 8
-   **Autenticação**: JWT (JSON Web Tokens)
-   **Documentação da API**: Swashbuckle (Swagger)
-   **Validação**: FluentValidation

### Frontend (Cliente Web)

-   **Framework**: React (com Vite)
-   **Linguagem**: TypeScript
-   **Estilização**: (A ser definido - ex: Tailwind CSS, Material-UI)

### Outros Clientes

A solução está estruturada para suportar múltiplas aplicações cliente, incluindo:

-   **MAUI**: Para aplicações de desktop e móveis multiplataforma.
-   **Tauri**: Para aplicações de desktop leves e seguras usando tecnologias web.

---

## 🚀 Começando

Siga estas instruções para obter uma cópia local do projeto em execução para fins de desenvolvimento e teste.

### Pré-requisitos

-   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
-   [Node.js e npm](https://nodejs.org/) (para o Cliente Web)
-   Servidor [PostgreSQL](https://www.postgresql.org/download/)
-   Um editor de código como [VS Code](https://code.visualstudio.com/) ou [Visual Studio](https://visualstudio.microsoft.com/)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Vytruve/storia-lite.git
    cd storia-lite
    ```

2.  **Configure o Banco de Dados:**
    -   Certifique-se de que seu servidor PostgreSQL esteja em execução.
    -   Crie um novo banco de dados, por exemplo, `storia_lite_db`.
    -   Você pode usar uma ferramenta como `pgAdmin` ou a linha de comando `psql`.

3.  **Configure o Backend:**
    -   Navegue até o diretório do projeto da API: `cd src/System/API`
    -   Renomeie `appsettings.Development.template.json` para `appsettings.Development.json`.
    -   Abra `appsettings.Development.json` e atualize a string de conexão `DefaultConnection` com suas credenciais do PostgreSQL.
        ```json
        "ConnectionStrings": {
          "DefaultConnection": "Host=localhost;Database=storia_lite_db;Username=seu_usuario;Password=sua_senha"
        },
        "JwtSettings": {
          "Secret": "UMA_CHAVE_SECRETA_MUITO_LONGA_E_SEGURA_ME_ALTERE",
          "Issuer": "StorIA-LITE",
          "Audience": "StorIA-LITE-Users"
        }
        ```
    -   **Importante**: Altere o `JwtSettings:Secret` para uma string longa, aleatória e secreta.

4.  **Instale as Dependências do Frontend:**
    -   Navegue até o diretório do cliente web: `cd ../../WebClient`
    -   Instale os pacotes npm necessários:
        ```bash
        npm install
        ```

---

## ▶️ Executando a Aplicação

### Executando a API de Backend

1.  Navegue até o diretório do projeto da API:
    ```bash
    cd src/System/API
    ```
2.  Execute a aplicação:
    ```bash
    dotnet run
    ```
3.  A API estará em execução em `https://localhost:7123` (ou uma porta similar). Você pode acessar a UI do Swagger em `https://localhost:7123/swagger` para explorar e testar os endpoints.

### Executando o Cliente Web

1.  Navegue até o diretório do cliente web:
    ```bash
    cd src/WebClient
    ```
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  A aplicação React estará disponível em `http://localhost:3000` (ou uma porta similar).

---

## ✅ Executando Testes

A solução inclui projetos para testes de unidade e integração (atualmente em desenvolvimento). Para executar os testes, navegue até a raiz da solução (`src/System`) e execute:

```bash
dotnet test
```

---

## swagger Documentação da API

Quando a API de backend estiver em execução, você pode acessar a documentação interativa do Swagger em seu navegador. Esta UI fornece uma lista completa de todos os endpoints disponíveis, seus parâmetros e respostas esperadas. Você pode até testar os endpoints diretamente do navegador.

**URL da UI do Swagger**: `https://localhost:7123/swagger`

---

## ☁️ Implantação (Deployment)

O repositório inclui arquivos de implantação do Kubernetes (`.yaml`) no diretório `src/System/Deploy`. Eles podem ser usados como um modelo para implantar a aplicação em um cluster Kubernetes.

Um `Dockerfile` também é fornecido em `src/System` para containerizar a API de backend.

---

## 🤝 Como Contribuir

As contribuições são o que tornam a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Quaisquer contribuições que você fizer são **muito apreciadas**.

Por favor, leia nosso arquivo [CONTRIBUTING.md](CONTRIBUTING.pt-BR.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

---

## 📜 Licença

Este projeto está licenciado sob a Licença Apache-2.0 - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato e Suporte

-   **Líder do Projeto**: Pedro Henrique ([phkaiser13](https://github.com/phkaiser13))
-   **Organização**: [Vytruve.org](https://vytruve.org)
-   **Issues do GitHub**: [https://github.com/Vytruve/storia-lite/issues](https://github.com/Vytruve/storia-lite/issues)

Se você tiver alguma dúvida, feedback ou precisar de suporte, por favor, abra uma issue no GitHub.
