#
# Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
# (a division of Vytruve.org)
# 
# Original Author: Pedro Henrique / phkaiser13
# 
# Description:
#   This is a multi-stage Dockerfile for building and running the StorIA-LITE
#   ASP.NET Core application.
#   - Stage 1 (build): Uses the full .NET SDK to compile the application,
#     restore dependencies, and publish the release artifacts. It is optimized
#     for build speed using Docker's layer caching.
#   - Stage 2 (final): Creates a minimal, production-ready image using the
#     lightweight ASP.NET Core runtime. This results in a smaller and more
#     secure final image by excluding the build tools and source code.
# 
# More information: https://vytruve.org
#
# SPDX-License-Identifier: Apache-2.0
#

# === Stage 1: Build Environment ===
# Use the official .NET SDK image, which contains all the tools needed to build the application.
# The 'AS build' syntax names this stage, so we can refer to it later.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Copy the project files first. This is a key optimization for Docker layer caching.
# The 'dotnet restore' step will only be re-run if these .csproj files change,
# not every time a .cs source file is modified.
COPY API/StorIA-Lite.API.csproj API/
COPY Application/StorIA-Lite.Application.csproj Application/
COPY Infrastructure/StorIA-Lite.Infrastructure.csproj Infrastructure/
COPY Domain/StorIA-Lite.Domain.csproj Domain/

# Restore NuGet packages for all projects based on the copied .csproj files.
RUN dotnet restore API/StorIA-Lite.API.csproj

# Copy the rest of the source code into the container.
COPY . .

# Publish the application for release. This compiles the code and packages all
# necessary files for deployment into the '/app/publish' directory.
# The '--no-restore' flag is used because we already restored packages in a previous step.
RUN dotnet publish API/StorIA-Lite.API.csproj -c Release -o /app/publish --no-restore


# === Stage 2: Final Production Image ===
# Use the lightweight ASP.NET Core runtime image, which is optimized for production.
# It's much smaller than the SDK image and has a reduced attack surface.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy only the published output from the 'build' stage into the final image.
# This ensures that no source code or intermediate build artifacts are included.
COPY --from=build /app/publish .

# Expose ports 8080 (HTTP) and 8081 (HTTPS). This is metadata that informs Docker
# that the container listens on these network ports. It does not publish the ports.
EXPOSE 8080
EXPOSE 8081

# Set the environment variable to configure Kestrel (the .NET web server) to listen
# on the specified ports for any incoming requests within the container's network.
ENV ASPNETCORE_URLS=http://+:8080;https://+:8081

# Define the entry point for the container. This is the command that will be executed
# when the container starts, launching the .NET application.
ENTRYPOINT ["dotnet", "StorIA-Lite.API.dll"]