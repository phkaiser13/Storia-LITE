/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the RegisterUserRequestDto class, a Data Transfer Object (DTO)
 *   used for new user registration requests. It encapsulates the essential information
 *   required to create a new user account, including their full name, email,
 *   password, and assigned role within the system.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) for a new user registration request.
    /// </summary>
    public class RegisterUserRequestDto
    {
        /// <summary>
        /// The user's full name.
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// The user's email address. This will be used for login.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// The password for the new user. It must meet complexity requirements.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// The role to be assigned to the user (e.g., "WarehouseManager", "HR").
        /// </summary>
        public string Role { get; set; }
    }
}