/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the AuthResultDto class, a Data Transfer Object (DTO)
 *   used to return the result of a successful user authentication. It encapsulates
 *   essential information for the client application after a user logs in,
 *   including the JWT access token, user details, and token expiration information.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) that represents the result of a successful authentication.
    /// This object is returned by the API to the client upon login.
    /// It contains essential information for the client to operate, such as the access token and user data.
    /// </summary>
    public class AuthResultDto
    {
        /// <summary>
        /// The JWT (JSON Web Token) generated for the user.
        /// This token must be sent in the 'Authorization' header of all subsequent requests.
        /// </summary>
        public string Token { get; init; }

        /// <summary>
        /// The unique identifier of the authenticated user.
        /// </summary>
        public Guid UserId { get; init; }

        /// <summary>
        /// The full name of the user, to be displayed in the UI (e.g., "Welcome, John Doe").
        /// </summary>
        public string FullName { get; init; }

        /// <summary>
        /// The user's role as a string (e.g., "WarehouseManager", "HR").
        /// Used by the client to enable or disable specific features.
        /// </summary>
        public string Role { get; init; }

        /// <summary>
        /// The date and time (in UTC) when the token will expire.
        /// </summary>
        public DateTime ExpiryDate { get; init; }

        /// <summary>
        /// The Refresh Token, which can be used to obtain a new JWT when the main one expires.
        /// </summary>
        public string RefreshToken { get; init; }
    }
}