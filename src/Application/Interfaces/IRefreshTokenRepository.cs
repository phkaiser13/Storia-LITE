/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the Refresh Token repository. It is
 *   responsible for managing the persistence of refresh tokens, which are used to
 *   obtain new access tokens without requiring users to re-enter their credentials.
 *   This abstraction is essential for the security and functionality of the authentication flow.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Domain.Entities;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for a Refresh Token repository.
    /// </summary>
    public interface IRefreshTokenRepository
    {
        /// <summary>
        /// Finds a refresh token by its token string, including the associated user data.
        /// </summary>
        /// <param name="token">The token string to search for.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains
        /// the RefreshToken entity with the user loaded, or null if not found.
        /// </returns>
        Task<RefreshToken> GetByTokenAsync(string token);

        /// <summary>
        /// Adds a new refresh token to the repository.
        /// </summary>
        /// <param name="token">The RefreshToken entity to be added.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddAsync(RefreshToken token);
    }
}