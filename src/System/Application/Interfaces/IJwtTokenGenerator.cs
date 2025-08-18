/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for a JSON Web Token (JWT) generator service.
 *   It abstracts the logic of token creation, including the definition of claims,
 *   signing, and expiration time, ensuring a consistent method for generating
 *   authentication tokens throughout the application.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;
using StorIA.Core.Domain.Entities;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for a JSON Web Token (JWT) generator service.
    /// It abstracts the token creation logic, including the definition of claims,
    /// signing, and expiration time.
    /// </summary>
    public interface IJwtTokenGenerator
    {
        /// <summary>
        /// Generates an authentication token for a specific user.
        /// </summary>
        /// <param name="user">The User entity for whom the token will be generated.</param>
        /// <returns>A tuple containing the generated JWT string and its expiration date.</returns>
        (string Token, DateTime ExpiryDate) GenerateToken(User user);
    }
}