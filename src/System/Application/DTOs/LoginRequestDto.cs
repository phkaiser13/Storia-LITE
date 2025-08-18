/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the LoginRequestDto class, a Data Transfer Object (DTO)
 *   used to capture user credentials (email and password) during the login process.
 *   It includes validation attributes to ensure the submitted data is in the
 *   correct format before being processed by the application.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using System.ComponentModel.DataAnnotations;

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    * Data Transfer Object(DTO) that represents the input data for a login request.
    * This class is used to deserialize the HTTP request body.
    /// </summary>
    public class LoginRequestDto
    {
        /// <summary>
        /// The email of the user attempting to log in.
        /// </summary>
        [Required(ErrorMessage = "The Email field is required.")]
        [EmailAddress(ErrorMessage = "The provided email format is invalid.")]
        public string Email { get; set; }

        /// <summary>
        /// The user's plain text password.
        /// </summary>
        [Required(ErrorMessage = "The Password field is required.")]
        public string Password { get; set; }
    }
}