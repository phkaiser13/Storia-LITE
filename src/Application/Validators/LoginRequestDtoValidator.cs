/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file provides the validation logic for the LoginRequestDto.
 *   Using FluentValidation, it ensures that the user's login credentials 
 *   (email and password) are present and correctly formatted before being 
 *   processed by the authentication service.
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
    /// Validator for the <see cref="LoginRequestDto"/>.
    /// This class centralizes and enhances the expressiveness of the input data validation logic.
    /// </summary>
    public class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LoginRequestDtoValidator"/> class,
        /// defining the validation rules for a user login request.
        /// </summary>
        public LoginRequestDtoValidator()
        {
            // Rule for the user's email address.
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("The Email field is required.")
                .EmailAddress().WithMessage("The provided email format is invalid.");

            // Rule for the user's password.
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("The Password field is required.");
        }
    }
}