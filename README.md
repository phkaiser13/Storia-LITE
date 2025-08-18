<h1 align="center">StorIA-LITE: Open Source Inventory Management System</h1>

<div align="center">
    <img src=".github/assets/storiaicon.svg" alt="StorIA-LITE Logo" width="150" />
</div>

<div align="center" style="margin-top: 10px;">
    <a href="https://github.com/Vytruve/storia-lite/actions">
        <img src="https://img.shields.io/github/actions/workflow/status/Vytruve/storia-lite/dotnet.yml?style=for-the-badge" alt="Build Status" />
    </a>
    <a href="LICENSE">
        <img src="https://img.shields.io/github/license/Vytruve/storia-lite?style=for-the-badge" alt="License" />
    </a>
    <a href="https://github.com/Vytruve/storia-lite/stargazers">
        <img src="https://img.shields.io/github/stars/Vytruve/storia-lite?style=for-the-badge" alt="GitHub stars" />
    </a>
    <a href="https://github.com/Vytruve/storia-lite/issues">
        <img src="https://img.shields.io/github/issues/Vytruve/storia-lite?style=for-the-badge" alt="GitHub issues" />
    </a>
</div>

<p align="center">
    <strong>StorIA-LITE</strong> is a powerful, flexible, and open-source inventory management system designed to bring efficiency and clarity to your stock control processes. Built with a modern technology stack and a clean, decoupled architecture, StorIA-LITE is ideal for small to medium-sized businesses, warehouses, and individuals who need a reliable way to track items, manage movements, and generate insightful reports.
</p>

<p align="center">
    This project is the "LITE" version of the more comprehensive StorIA ERP/CRM system, offering core inventory functionalities in a lightweight and accessible package.
</p>

---

## 📖 Table of Contents

- [Full Documentation](#-full-documentation)
- [Core Features](#-core-features)
- [Project Philosophy](#-project-philosophy)
- [Architectural Overview](#-architectural-overview)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Running the Application](#-running-the-application)
  - [Running the Backend API](#running-the-backend-api)
  - [Running the Web Client](#running-the-web-client)
- [Running Tests](#-running-tests)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact & Support](#-contact--support)

---

## 📚 Full Documentation

This README provides a general overview of the project. For more detailed, in-depth documentation, including feature guides, API references, and tutorials, please visit our full documentation hub.

➡️ **[Explore the Full Documentation](./docs/en/README.md)**

---

## ✨ Core Features

StorIA-LITE provides a robust set of features to cover all essential inventory management needs:

- **Item Management**: Full CRUD (Create, Read, Update, Delete) functionality for your inventory items. Track SKUs, categories, descriptions, quantities, and even expiration dates.
- **Movement Tracking**: Log all stock movements, whether it's an entry (receiving goods) or an exit (shipping or internal use). Every movement is recorded against a user and an item, providing a full audit trail.
- **User Management**: Secure user registration and authentication system with role-based access control (RBAC).
- **Authentication**: Modern JWT-based authentication to secure your API endpoints.
- **Dashboard Analytics**: A comprehensive dashboard that provides an at-a-glance overview of key inventory metrics, such as total items, stock levels, and recent movements.
- **Reporting**: Generate detailed reports on inventory status, movement history, and more, allowing for data-driven decision-making.
- **Search and Pagination**: Efficiently search and navigate through large sets of items and movements.

---

## 💡 Project Philosophy

The development of StorIA-LITE is guided by a few core principles:

1.  **Clean Architecture**: We strictly follow the principles of Clean Architecture. This means a clear separation of concerns between the Domain, Application, and Infrastructure layers. This makes the system more maintainable, testable, and scalable.
2.  **Open Source**: We believe in the power of community. StorIA-LITE is fully open-source under the Apache-2.0 license, and we welcome contributions from developers everywhere.
3.  **Modern & Reliable Technology**: The system is built on top of .NET 8, a long-term support (LTS) release, ensuring stability and access to the latest C# features. We use proven technologies like PostgreSQL for the database and React for the frontend.
4.  **Extensibility**: Although this is a "LITE" version, it's built with extensibility in mind. The decoupled nature of the architecture makes it easy to add new features or integrate with other systems.

---

## 🏗️ Architectural Overview

For a detailed explanation of our architecture, including diagrams and data flow examples, please see the [**Architecture Documentation**](./docs/en/architecture/README.md).

---

## 💻 Technology Stack

### Backend

-   **Framework**: .NET 8 (C#)
-   **Database**: PostgreSQL
-   **ORM**: Entity Framework Core 8
-   **Authentication**: JWT (JSON Web Tokens)
-   **API Documentation**: Swashbuckle (Swagger)
-   **Validation**: FluentValidation

### Frontend (Web Client)

-   **Framework**: React (with Vite)
-   **Language**: TypeScript
--   **Styling**: (To be determined - e.g., Tailwind CSS, Material-UI)

### Other Clients

The solution is structured to support multiple client applications, including:

-   **MAUI**: For cross-platform desktop and mobile applications.
-   **Tauri**: For lightweight, secure desktop applications using web technologies.

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
-   [Node.js and npm](https://nodejs.org/) (for the Web Client)
-   [PostgreSQL](https://www.postgresql.org/download/) Server
-   A code editor like [VS Code](https://code.visualstudio.com/) or [Visual Studio](https://visualstudio.microsoft.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vytruve/storia-lite.git
    cd storia-lite
    ```

2.  **Setup the Database:**
    -   Make sure your PostgreSQL server is running.
    -   Create a new database, for example, `storia_lite_db`.
    -   You can use a tool like `pgAdmin` or the `psql` command line.

3.  **Configure the Backend:**
    -   Navigate to the API project directory: `cd src/System/API`
    -   Rename `appsettings.Development.template.json` to `appsettings.Development.json`.
    -   Open `appsettings.Development.json` and update the `DefaultConnection` string with your PostgreSQL credentials.
        ```json
        "ConnectionStrings": {
          "DefaultConnection": "Host=localhost;Database=storia_lite_db;Username=your_username;Password=your_password"
        },
        "JwtSettings": {
          "Secret": "A_VERY_LONG_AND_SECURE_SECRET_KEY_CHANGE_ME",
          "Issuer": "StorIA-LITE",
          "Audience": "StorIA-LITE-Users"
        }
        ```
    -   **Important**: Change the `JwtSettings:Secret` to a long, random, and secret string.

4.  **Install Frontend Dependencies:**
    -   Navigate to the web client directory: `cd ../../WebClient`
    -   Install the required npm packages:
        ```bash
        npm install
        ```

---

## ▶️ Running the Application

### Running the Backend API

1.  Navigate to the API project directory:
    ```bash
    cd src/System/API
    ```
2.  Run the application:
    ```bash
    dotnet run
    ```
3.  The API will be running at `https://localhost:7123` (or a similar port). You can access the Swagger UI at `https://localhost:7123/swagger` to explore and test the endpoints.

### Running the Web Client

1.  Navigate to the web client directory:
    ```bash
    cd src/WebClient
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  The React application will be available at `http://localhost:3000` (or a similar port).

---

## ✅ Running Tests

The solution includes projects for unit and integration tests (currently under development). To run the tests, navigate to the solution root (`src/System`) and run:

```bash
dotnet test
```

---

##  swagger API Documentation

Once the backend API is running, you can access the interactive Swagger documentation in your browser. This UI provides a complete list of all available endpoints, their parameters, and expected responses. You can even test the endpoints directly from the browser.

**Swagger UI URL**: `https://localhost:7123/swagger`

---

## ☁️ Deployment

The repository includes Kubernetes deployment files (`.yaml`) in the `src/System/Deploy` directory. These can be used as a template for deploying the application to a Kubernetes cluster.

A `Dockerfile` is also provided in `src/System` to containerize the backend API.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

---

## 📜 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

-   **Project Lead**: Pedro Henrique ([phkaiser13](https://github.com/phkaiser13))
-   **Organization**: [Vytruve.org](https://vytruve.org)
-   **GitHub Issues**: [https://github.com/Vytruve/storia-lite/issues](https://github.com/Vytruve/storia-lite/issues)

If you have any questions, feedback, or need support, please open an issue on GitHub.
