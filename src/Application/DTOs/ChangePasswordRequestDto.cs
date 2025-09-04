/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the ChangePasswordRequestDto class, a Data Transfer Object (DTO)
 *   used to handle requests for changing a user's password. It encapsulates the
 *   necessary data for the password change process, including the current password,
 *   the new password, and a confirmation of the new password.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// DTO for a logged-in user's password change request.
    /// </summary>
    public class ChangePasswordRequestDto
    {
        /// <summary>
        /// The user's current password.
        /// </summary>
        public string CurrentPassword { get; set; }

        /// <summary>
        /// The desired new password.
        /// </summary>
        public string NewPassword { get; set; }

        /// <summary>
        /// The confirmation of the new password.
        /// </summary>
        public string ConfirmNewPassword { get; set; }
    }
}