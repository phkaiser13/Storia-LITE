/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the RefreshTokenRequestDto class, a Data Transfer Object (DTO)
 *   used to handle requests for refreshing an authentication token. It contains
 *   the refresh token provided by the client.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using System.ComponentModel.DataAnnotations;

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// DTO for the token refresh request.
    /// </summary>
    public class RefreshTokenRequestDto
    {
        /// <summary>
        /// The Refresh Token held by the client.
        /// </summary>
        [Required]
        public string RefreshToken { get; set; }
    }
}