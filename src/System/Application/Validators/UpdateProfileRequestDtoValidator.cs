/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the validator for the UpdateProfileRequestDto. It leverages
 *   FluentValidation to enforce business rules for updating a user's profile.
 *   The validation ensures that the FullName and Email fields are correctly
 *   formatted and adhere to the specified constraints, maintaining data consistency.
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
    /// Validator for the DTO used in user profile update requests.
    /// </summary>
    public class UpdateProfileRequestDtoValidator : AbstractValidator<UpdateProfileRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateProfileRequestDtoValidator"/> class,
        /// setting up the validation rules for updating a user profile.
        /// </summary>
        public UpdateProfileRequestDtoValidator()
        {
            // Rule for the user's full name.
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(250).WithMessage("Full name cannot exceed 250 characters.");

            // Rule for the user's email address.
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("The provided email format is invalid.");
        }
    }
}