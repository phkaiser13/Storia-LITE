/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the 'User' entity, which represents a user within the system,
 *   such as a Warehouse Manager, HR, Employee, or Admin. This entity is fundamental
 *   for handling authentication, authorization, and tracking the movements of items.
 *   It stores user credentials (as a hash), role, and status.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Domain.Enums;

namespace StorIA.Core.Domain.Entities
{
    /// <summary>
    /// Represents a user in the system, who can be a Warehouse Manager, HR, Employee, or Admin.
    /// This entity is crucial for authentication, authorization, and tracking movements.
    /// </summary>
    public class User
    {
        /// <summary>
        /// Gets the unique identifier for the user.
        /// </summary>
        public Guid Id { get; private set; }

        /// <summary>
        /// Gets the user's full name.
        /// </summary>
        public string FullName { get; private set; }

        /// <summary>
        /// Gets the user's email address, used for login and notifications.
        /// </summary>
        public string Email { get; private set; }

        /// <summary>
        /// Gets the user's password hash. NEVER store plain-text passwords.
        /// The hash is generated and verified in the application layer.
        /// </summary>
        public string PasswordHash { get; private set; }

        /// <summary>
        /// Gets the collection of refresh tokens associated with the user.
        /// </summary>
        public virtual ICollection<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();

        /// <summary>
        /// Gets the user's role (access level) within the system.
        /// </summary>
        public UserRole Role { get; private set; }

        /// <summary>
        /// Gets a value indicating whether the user's account is active. An inactive user cannot log in.
        /// </summary>
        public bool IsActive { get; private set; }

        /// <summary>
        /// Gets the date and time when the user record was created.
        /// </summary>
        public DateTime CreatedAt { get; private set; }

        /// <summary>
        /// Gets the date and time of the last update to the user record.
        /// </summary>
        public DateTime? UpdatedAt { get; private set; }

        // Private parameterless constructor for ORM frameworks like EF Core.
        private User() { }

        /// <summary>
        /// Initializes a new instance of the <see cref="User"/> class.
        /// </summary>
        /// <param name="fullName">The user's full name.</param>
        /// <param name="email">The user's email address.</param>
        /// <param name="role">The user's role in the system.</param>
        public User(string fullName, string email, UserRole role)
        {
            Id = Guid.NewGuid();
            FullName = fullName;
            Email = email.ToLowerInvariant(); // Normalize email to lowercase for consistency
            Role = role;
            IsActive = true; // By default, a new user is created as active
            CreatedAt = DateTime.UtcNow;

            Validate();
        }

        /// <summary>
        /// Updates a user's profile information.
        /// </summary>
        /// <param name="fullName">The updated full name.</param>
        /// <param name="email">The updated email address.</param>
        /// <param name="role">The updated user role.</param>
        public void UpdateDetails(string fullName, string email, UserRole role)
        {
            FullName = fullName;
            Email = email.ToLowerInvariant();
            Role = role;
            UpdatedAt = DateTime.UtcNow;

            Validate();
        }

        /// <summary>
        /// Sets the password hash for the user.
        /// This method should be called by the application layer after generating the hash.
        /// </summary>
        /// <param name="passwordHash">The generated password hash.</param>
        /// <exception cref="ArgumentException">Thrown if the password hash is null or empty.</exception>
        public void SetPassword(string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(passwordHash))
            {
                throw new ArgumentException("Password hash cannot be empty.", nameof(passwordHash));
            }
            PasswordHash = passwordHash;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Deactivates the user's account, preventing them from logging in.
        /// </summary>
        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Reactivates the user's account.
        /// </summary>
        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Validates the entity's state to ensure data consistency.
        /// </summary>
        /// <exception cref="ArgumentException">Thrown if validation fails.</exception>
        private void Validate()
        {
            if (string.IsNullOrWhiteSpace(FullName))
                throw new ArgumentException("User's full name cannot be empty.");
            if (string.IsNullOrWhiteSpace(Email) || !Email.Contains("@"))
                throw new ArgumentException("User's email is invalid.");
        }
    }
}