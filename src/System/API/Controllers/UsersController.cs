/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the UsersController, which is responsible for handling all
 *   HTTP requests related to user management. It exposes endpoints for user
 *   registration, profile updates, password changes, and listing all users.
 *   The controller uses role-based authorization to secure sensitive operations.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Provides attributes for authorizing users, a core part of securing endpoints.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;

namespace StorIA.API.Controllers
{
    /// <summary>
    /// Controller to manage user-related operations.
    /// </summary>
    [ApiController] // Indicates that this class is an API controller, enabling features like automatic model validation.
    [Route("api/[controller]")] // Defines the base route for this controller: /api/users
    public class UsersController : ControllerBase
    {
        // A private, read-only field to hold the user service dependency.
        private readonly IUserService _userService;

        /// <summary>
        /// Initializes a new instance of the <see cref="UsersController"/> class.
        /// </summary>
        /// <param name="userService">The user service, injected via dependency injection.</param>
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Registers a new user in the system.
        /// </summary>
        /// <param name="request">The data required to register a new user.</param>
        /// <returns>The newly created user's data.</returns>
        [HttpPost] // Maps this action to handle HTTP POST requests.
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)] // Documents a successful creation response.
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)] // Documents a response for invalid input data.
        [ProducesResponseType(typeof(object), StatusCodes.Status409Conflict)] // Documents a response for conflicts, like a duplicate email.
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserRequestDto request)
        {
            // The DTO validation (using FluentValidation) is automatically handled by the ASP.NET Core pipeline.
            // If validation fails, the pipeline returns a 400 Bad Request before this method is even executed.

            try
            {
                var newUserDto = await _userService.RegisterUserAsync(request);

                // Return 201 Created, which is the correct HTTP status for creating a new resource.
                // The first argument points to a future "GetUserById" action, following REST conventions.
                // The second argument provides the route value for the new resource's ID.
                // The third argument is the response body (the newly created user).
                return CreatedAtAction("GetUserById", new { id = newUserDto.Id }, newUserDto);
            }
            catch (ValidationException ex)
            {
                // If the service layer throws a ValidationException (e.g., for a duplicate email),
                // we return a 409 Conflict, which is the appropriate status code.
                return Conflict(new { message = ex.Message });
            }
            // Other unexpected exceptions will be caught by our global exception handling middleware.
        }

        /// <summary>
        /// Updates the profile details of the currently authenticated user.
        /// </summary>
        [HttpPut("me")] // Maps this action to HTTP PUT requests at the route /api/users/me
        [Authorize] // Ensures that only authenticated (logged-in) users can call this endpoint.
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateCurrentUserProfile([FromBody] UpdateProfileRequestDto request)
        {
            // 1. Get the user ID from the JWT token.
            // The 'sub' (Subject) claim standardly contains the user's unique identifier.
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                // This should not happen if the token is valid, but it's a necessary security check.
                return Unauthorized();
            }

            try
            {
                var updatedUser = await _userService.UpdateProfileAsync(userId, request);
                return Ok(updatedUser);
            }
            catch (ValidationException ex)
            {
                // Return 409 Conflict if the new email is already in use by another user.
                return Conflict(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                // Return 404 Not Found if, for some reason, the user ID from the token does not exist in the database.
                return NotFound(new { message = "User not found." });
            }
        }

        /// <summary>
        /// Changes the password for the currently authenticated user.
        /// </summary>
        [HttpPost("me/change-password")] // Maps this action to HTTP POST requests at /api/users/me/change-password
        [Authorize] // Ensures that only authenticated users can access this endpoint.
        [ProducesResponseType(StatusCodes.Status204NoContent)] // Documents a successful response with no body content.
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Documents a response for incorrect current password.
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Documents a response for unauthenticated requests.
        public async Task<IActionResult> ChangeCurrentUserPassword([FromBody] ChangePasswordRequestDto request)
        {
            // 1. Get the user ID from the JWT token.
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var success = await _userService.ChangePasswordAsync(userId, request);

            if (!success)
            {
                // If the service returns false, it means the provided current password was incorrect.
                return BadRequest(new { message = "The current password provided is incorrect." });
            }

            // Return 204 No Content, which is the standard response for a successful action that does not return any content.
            return NoContent();
        }

        /// <summary>
        /// Lists system users in a paginated format, with support for searching and sorting.
        /// </summary>
        /// <param name="queryParams">Parameters for pagination, searching, and sorting.</param>
        /// <remarks>
        /// Access is restricted to users with the "RH" (HR) role.
        /// Example usage: GET /api/users?pageNumber=1&pageSize=10&searchTerm=pedro
        /// </remarks>
        [HttpGet] // Maps this action to handle HTTP GET requests.
        [Authorize(Roles = "RH")] // Restricts access to users who have the "RH" role.
        [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers([FromQuery] QueryParameters queryParams)
        {
            var pagedResult = await _userService.GetAllUsersAsync(queryParams);
            return Ok(pagedResult);
        }

        /// <summary>
        /// Retrieves a single user by their unique ID.
        /// </summary>
        /// <param name="id">The GUID of the user to retrieve.</param>
        /// <remarks>
        /// Access is restricted to users with the "RH" (HR) role.
        /// </remarks>
        [HttpGet("{id}", Name = "GetUserById")]
        [Authorize(Roles = "RH")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
    }
}