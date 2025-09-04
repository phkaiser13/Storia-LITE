/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the User repository. It abstracts the
 *   data access logic for the User entity, allowing the application layer to
 *   interact with user data without being coupled to the specific database implementation.
 *   It includes standard CRUD operations as well as specialized query methods.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Domain.Entities;
using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for a User repository.
    /// It abstracts the data access logic for the User entity, allowing the application layer
    /// to manage users without knowing the details of the database implementation.
    /// </summary>
    public interface IUserRepository
    {
        /// <summary>
        /// Finds a user by their unique identifier.
        /// </summary>
        /// <param name="id">The ID of the user to find.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the User object if found; otherwise, null.</returns>
        Task<User> GetByIdAsync(Guid id);

        /// <summary>
        /// Finds a user by their email address. This method is crucial for the login process.
        /// </summary>
        /// <param name="email">The email of the user to find.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the User object if found; otherwise, null.</returns>
        Task<User> GetByEmailAsync(string email);

        /// <summary>
        /// Retrieves a collection of all users registered in the system.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of all users.</returns>
        Task<IEnumerable<User>> GetAllAsync();

        /// <summary>
        /// Adds a new user to the repository.
        /// </summary>
        /// <param name="user">The User entity to be added.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddAsync(User user);

        /// <summary>
        /// Updates an existing user in the repository.
        /// </summary>
        /// <param name="user">The User entity with the updated data.</param>
        void Update(User user);

        /// <summary>
        /// Removes a user from the repository by their ID.
        /// </summary>
        /// <param name="id">The ID of the user to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task DeleteAsync(Guid id);

        /// <summary>
        /// Returns a paginated list of users, applying search and sorting filters.
        /// </summary>
        /// <param name="queryParams">The parameters for searching, sorting, and pagination.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a paged result with the users and pagination metadata.</returns>
        Task<PagedResult<User>> GetPagedAsync(QueryParameters queryParams);

        /// <summary>
        /// Counts the total number of active users in the system.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains the count of active users.</returns>
        Task<int> CountActiveAsync();
    }
}