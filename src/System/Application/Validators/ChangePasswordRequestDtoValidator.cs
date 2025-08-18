/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the validator for the ChangePasswordRequestDto. 
 *   It uses FluentValidation to enforce strong password policies when a user 
 *   attempts to change their password, ensuring the new password meets security 
 *   requirements and that the confirmation matches.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using FluentValidation;
using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Validators
{
    /// <summary>
    /// Validator for the <see cref="ChangePasswordRequestDto"/>.
    /// </summary>
    public class ChangePasswordRequestDtoValidator : AbstractValidator<ChangePasswordRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ChangePasswordRequestDtoValidator"/> class,
        /// setting up the validation rules for the change password request.
        /// </summary>
        public ChangePasswordRequestDtoValidator()
        {
            // Rule for the user's current password.
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Current password is required.");

            // Rules for the new password, enforcing security policies.
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("New password is required.")
                .MinimumLength(8).WithMessage("New password must be at least 8 characters long.")
                .Matches("[A-Z]").WithMessage("New password must contain at least one uppercase letter.")
                .Matches("[a-z]").WithMessage("New password must contain at least one lowercase letter.")
                .Matches("[0-9]").WithMessage("New password must contain at least one number.")
                .Matches("[^a-zA-Z0-9]").WithMessage("New password must contain at least one special character.");

            // Rule to ensure the new password and its confirmation match.
            RuleFor(x => x.ConfirmNewPassword)
                .NotEmpty().WithMessage("Password confirmation is required.")
                .Equal(x => x.NewPassword).WithMessage("The new password and confirmation password do not match.");
        }
    }
}