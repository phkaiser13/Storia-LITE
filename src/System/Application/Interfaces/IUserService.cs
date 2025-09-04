/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the user management service. It acts as
 *   the primary entry point for all user-related business logic, such as registration,
 *   profile updates, and password management. By abstracting the core logic, it
 *   decouples the presentation layer (e.g., API controllers) from the application's
 *   internal workings.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the user management service.
    /// Responsible for CRUD operations and other business logic related to users.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Registers a new user in the system.
        /// </summary>
        /// <param name="request">The DTO containing the data for the new user registration.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains a DTO 
        /// with the newly created user's data upon success.
        /// Throws an exception (e.g., ValidationException) if the email already exists or if the data is invalid.
        /// </returns>
        Task<UserDto> RegisterUserAsync(RegisterUserRequestDto request);

        /// <summary>
        /// Retrieves a specific user by their unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains the user's DTO
        /// if found; otherwise, returns null.
        /// </returns>
        Task<UserDto> GetUserByIdAsync(Guid id);

        /// <summary>
        /// Updates the profile details of a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user whose profile will be updated.</param>
        /// <param name="request">The DTO containing the new profile data.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the user DTO with the updated data.</returns>
        Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request);

        /// <summary>
        /// Changes a specific user's password after verifying the current password.
        /// </summary>
        /// <param name="userId">The ID of the user whose password will be changed.</param>
        /// <param name="request">The DTO containing the current and new passwords.</param>
        /// <returns>A task that represents the asynchronous operation. The task result is true if the password was changed successfully.</returns>
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);

        /// <summary>
        /// Retrieves a paginated list of all users in the system.
        /// </summary>
        /// <param name="queryParams">The parameters for searching, sorting, and pagination.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a paged result of all user DTOs.</returns>
        Task<PagedResult<UserDto>> GetAllUsersAsync(QueryParameters queryParams);
    }
}