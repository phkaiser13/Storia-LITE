/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the 'RefreshToken' entity, which is a critical component of the
 *   authentication system. Refresh tokens are used in token-based authentication (like JWT)
 *   to allow users to obtain new access tokens without re-entering their credentials,
 *   providing a secure and seamless user experience. This entity stores the token value,
 *   its expiration, and its revocation status.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Domain.Entities
{
    /// <summary>
    /// Represents a Refresh Token in the system.
    /// Used to allow users to obtain new access tokens (JWT)
    /// without needing to re-enter their credentials.
    /// </summary>
    public class RefreshToken
    {
        /// <summary>
        /// Gets the token itself, a cryptographically secure and random string.
        /// This serves as the primary key.
        /// </summary>
        public string Token { get; private set; }

        /// <summary>
        /// Gets the ID of the user to whom this token belongs. This is a foreign key.
        /// </summary>
        public Guid UserId { get; private set; }

        /// <summary>
        /// Gets the navigation property for the associated User.
        /// </summary>
        public virtual User User { get; private set; }

        /// <summary>
        /// Gets the date and time when this token expires.
        /// </summary>
        public DateTime ExpiryDate { get; private set; }

        /// <summary>
        /// Gets a value indicating whether the token has been used or revoked.
        /// A revoked token cannot be used to obtain a new JWT.
        /// </summary>
        public bool IsRevoked { get; private set; }

        /// <summary>
        /// Gets a value indicating whether the token is currently active (i.e., not expired and not revoked).
        /// </summary>
        public bool IsActive => !IsRevoked && ExpiryDate > DateTime.UtcNow;

        // Private parameterless constructor for ORM frameworks like EF Core.
        private RefreshToken() { }

        /// <summary>
        /// Initializes a new instance of the <see cref="RefreshToken"/> class.
        /// </summary>
        /// <param name="token">The secure token string.</param>
        /// <param name="userId">The ID of the user associated with the token.</param>
        /// <param name="expiryDate">The token's expiration date.</param>
        public RefreshToken(string token, Guid userId, DateTime expiryDate)
        {
            Token = token;
            UserId = userId;
            ExpiryDate = expiryDate;
            IsRevoked = false;
        }

        /// <summary>
        /// Marks the token as revoked, preventing its future use.
        /// </summary>
        public void Revoke()
        {
            IsRevoked = true;
        }
    }
}