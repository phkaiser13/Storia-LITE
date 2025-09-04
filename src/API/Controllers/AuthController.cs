/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the Authentication Controller for the StorIA API.
 *   It handles user authentication endpoints, including user login and
 *   JWT refresh token operations. It leverages the IAuthService to process
 *   the core authentication logic, keeping the controller lean and focused
 *   on handling HTTP requests and responses.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.AspNetCore.Mvc;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;

namespace StorIA.API.Controllers
{
    /// <summary>
    /// Manages authentication-related endpoints for the API.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Defines the base route as /api/auth
    public class AuthController : ControllerBase
    {
        // Private field to hold the authentication service dependency.
        private readonly IAuthService _authService;

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthController"/> class.
        /// </summary>
        /// <param name="authService">The authentication service injected via dependency injection.</param>
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT upon successful validation.
        /// </summary>
        /// <param name="request">The user's login credentials (email and password).</param>
        /// <returns>A 200 OK result with the authentication token or a 401 Unauthorized on failure.</returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            // Model validation (e.g., required fields) is automatically handled by ASP.NET Core
            // due to the [ApiController] attribute.

            // Delegate the business logic to the application service.
            var authResult = await _authService.LoginAsync(request.Email, request.Password);

            // If the result is null, authentication failed (e.g., invalid credentials or inactive account).
            if (authResult == null)
            {
                // Return 401 Unauthorized, which is the standard HTTP status code for authentication failure.
                return Unauthorized(new { message = "Invalid credentials." });
            }

            // If authentication is successful, return 200 OK with the DTO containing the token.
            return Ok(authResult);
        }

        /// <summary>
        /// Generates a new JWT and Refresh Token pair using a valid Refresh Token.
        /// </summary>
        /// <param name="request">The DTO containing the Refresh Token.</param>
        /// <returns>A new AuthResultDto on success, or 401 Unauthorized if the token is invalid.</returns>
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            // Delegate the token refresh logic to the authentication service.
            var authResult = await _authService.RefreshTokenAsync(request.RefreshToken);

            // If the service returns null, the refresh token was invalid or expired.
            if (authResult == null)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token." });
            }

            // Return the new set of tokens.
            return Ok(authResult);
        }
    }
}