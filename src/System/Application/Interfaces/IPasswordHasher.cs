/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for a password hashing service. It abstracts
 *   the specific hashing algorithm, allowing it to be easily replaced or updated
 *   in the future without impacting the core application logic. This is a critical
 *   component for ensuring secure password storage.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for a password hashing service.
    /// It abstracts the specific hashing algorithm, allowing it to be
    /// easily replaced or updated in the future.
    /// </summary>
    public interface IPasswordHasher
    {
        /// <summary>
        /// Creates a hash from a plain text password.
        /// </summary>
        /// <param name="password">The plain text password to be hashed.</param>
        /// <returns>A string representing the secure hash of the password.</returns>
        string HashPassword(string password);

        /// <summary>
        /// Verifies if a plain text password matches a stored hash.
        /// </summary>
        /// <param name="storedHash">The password hash that is stored in the database.</param>
        /// <param name="providedPassword">The plain text password provided by the user during login.</param>
        /// <returns>True if the password matches the hash; otherwise, false.</returns>
        bool VerifyPassword(string storedHash, string providedPassword);
    }
}