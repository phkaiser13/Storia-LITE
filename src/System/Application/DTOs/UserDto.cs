/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the UserDto class, a Data Transfer Object (DTO) that
 *   represents a safe, public-facing view of a user. It is used as a return
 *   type for API endpoints that expose user information, intentionally omitting
 *   sensitive data like password hashes.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) that represents a safe, public-facing view of a user.
    /// Used as a return type for endpoints that handle user data.
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// The unique identifier for the user.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The user's full name.
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// The user's email address.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// The user's role within the system.
        /// </summary>
        public string Role { get; set; }

        /// <summary>
        /// The cost center to which the user belongs. Can be null.
        /// </summary>
        public string? CostCenter { get; set; }

        /// <summary>
        /// Indicates whether the user's account is active.
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// The date when the user was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}