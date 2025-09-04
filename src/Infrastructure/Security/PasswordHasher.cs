/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file implements the IPasswordHasher interface using the BCrypt algorithm.
 *   It provides robust and secure methods for hashing new passwords and verifying
 *   existing ones against a stored hash. BCrypt is chosen for its built-in salt
 *   generation and computational complexity, which helps protect against
 *   brute-force and rainbow table attacks.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.Interfaces;
// The 'using static' directive allows us to call static methods (e.g., HashPassword)
// directly without prefixing them with the class name (e.g., BCrypt.Net.BCrypt.HashPassword).
using static BCrypt.Net.BCrypt;

namespace StorIA.Infrastructure.Security
{
    /// <summary>
    /// Provides an implementation of the password hashing service using the BCrypt algorithm.
    /// BCrypt is the industry standard for password hashing due to its design, which is intentionally slow.
    /// It automatically manages the generation of a unique salt for each hash, making it highly
    /// resistant to brute-force and rainbow table attacks.
    /// </summary>
    public class PasswordHasher : IPasswordHasher
    {
        /// <inheritdoc />
        public string HashPassword(string password)
        {
            // The HashPassword method from BCrypt.Net generates a random salt and incorporates
            // it directly into the resulting hash string. This simplifies storage, as we only
            // need a single database column for the complete hash.
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        /// <inheritdoc />
        public bool VerifyPassword(string storedHash, string providedPassword)
        {
            // The Verify method extracts the salt from the 'storedHash', applies it to the 'providedPassword',
            // and then compares the results using a constant-time comparison algorithm to prevent timing attacks.
            try
            {
                return BCrypt.Net.BCrypt.Verify(providedPassword, storedHash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // If the stored hash is not a valid BCrypt hash, the library will throw
                // a SaltParseException. We catch this and return false for security reasons,
                // treating it as a failed verification attempt.
                return false;
            }
        }
    }
}