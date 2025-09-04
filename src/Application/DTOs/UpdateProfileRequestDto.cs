/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the UpdateProfileRequestDto class, a Data Transfer Object (DTO)
 *   used for updating the profile details of the currently authenticated user.
 *   It allows for changes to the user's full name and email address.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// DTO for the request to update the profile details of the logged-in user.
    /// </summary>
    public class UpdateProfileRequestDto
    {
        /// <summary>
        /// The user's new full name.
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// The user's new email address.
        /// </summary>
        public string Email { get; set; }
    }
}