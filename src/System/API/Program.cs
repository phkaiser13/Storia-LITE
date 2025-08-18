/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This is the main entry point for the StorIA-LITE ASP.NET Core application.
 *   It is responsible for configuring services for dependency injection, setting up
 *   the application's middleware pipeline, and starting the web host. Key configurations
 *   include database context, authentication (JWT), authorization, CORS, Swagger for API
 *   documentation, and centralized service registration.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Application.Mappings;
using StorIA.Core.Application.Services;
using StorIA.Infrastructure.Persistence;
using StorIA.Infrastructure.Security;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Service Configuration (Dependency Injection) ---

// Add services for controllers and configure FluentValidation to automatically
// find and register validators from the assembly containing IAuthService.
builder.Services.AddControllers()
    .AddFluentValidation(fv =>
    {
        fv.RegisterValidatorsFromAssemblyContaining<IAuthService>();
    });

// Configure Cross-Origin Resource Sharing (CORS) to allow requests from any origin,
// method, and header. This is a permissive policy suitable for development or public APIs.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAnyOrigin",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// Configure the database context (AppDbContext) to use PostgreSQL (Npgsql)
// with the connection string retrieved from the application's configuration.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- Centralized Dependency Registration ---

// Register the Unit of Work pattern as a scoped service.
// This should be the single point of access to repositories.
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IMovementService, MovementService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();


// Register Infrastructure Services (Security)
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// Configure AutoMapper by scanning the assembly of MappingProfile for mapping configurations.
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// --- End of Centralized Registration ---

// Configure JWT (JSON Web Token) authentication.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Define the parameters for validating incoming JWTs.
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // Retrieve JWT settings from appsettings.json or environment variables.
        // IMPORTANT: For production, use a secure way to store and manage the secret key.
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]))
    };
});

// Add API explorer services, which are required for Swagger/OpenAPI.
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger generator to produce OpenAPI documentation.
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "StorIA-Lite API", Version = "v1" });

    // Define the Bearer token security scheme for JWT authentication in Swagger UI.
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Add a security requirement to enforce JWT authentication on all endpoints in the Swagger UI.
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// --- 2. HTTP Request Pipeline Configuration ---

// Configure a global exception handler for the application.
// This middleware catches unhandled exceptions and returns a standardized JSON error response.
app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (contextFeature != null)
        {
            // In development, provide detailed error messages. In production, use a generic message.
            var errorResponse = new
            {
                StatusCode = context.Response.StatusCode,
                Message = app.Environment.IsDevelopment()
                    ? $"Internal Server Error: {contextFeature.Error.Message}"
                    : "An unexpected error occurred. Please try again later."
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
        }
    });
});

// Enable Swagger and Swagger UI only in the development environment for API testing and documentation.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirect HTTP requests to HTTPS.
app.UseHttpsRedirection();

// Apply the CORS policy defined earlier.
app.UseCors("AllowAnyOrigin");

// Enable authentication middleware to validate credentials.
app.UseAuthentication();

// Enable authorization middleware to enforce access control.
app.UseAuthorization();

// Map controller routes.
app.MapControllers();

// Start the application.
app.Run();