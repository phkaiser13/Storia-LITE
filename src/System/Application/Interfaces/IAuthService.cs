/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the authentication service. It outlines
 *   the methods required for user login and token refreshing, forming the core of
 *   the application's authentication mechanism.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the authentication service.
    /// Responsible for validating user credentials and issuing access tokens.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Attempts to authenticate a user based on the provided email and password.
        /// </summary>
        /// <param name="email">The user's email address.</param>
        /// <param name="password">The user's plain text password.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains
        /// an <see cref="AuthResultDto"/> object with the JWT and user information upon successful authentication.
        /// Returns null if authentication fails (e.g., user not found, incorrect password, or inactive account).
        /// </returns>
        Task<AuthResultDto> LoginAsync(string email, string password);

        /// <summary>
        /// Generates a new pair of JWT and Refresh Token using a valid, existing refresh token.
        /// </summary>
        /// <param name="refreshToken">The refresh token provided by the client.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains
        /// a new <see cref="AuthResultDto"/> object upon success.
        /// Returns null if the refresh token is invalid, expired, or has been revoked.
        /// </returns>
        Task<AuthResultDto> RefreshTokenAsync(string refreshToken);
    }
}