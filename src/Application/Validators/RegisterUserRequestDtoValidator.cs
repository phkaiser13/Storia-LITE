/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the validator for the RegisterUserRequestDto using FluentValidation.
 *   It establishes the business rules and constraints for creating a new user, ensuring
 *   data integrity for properties like FullName, Email, Password, and Role. This validator
 *   is a crucial component of the user registration process.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using FluentValidation;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Domain.Enums;

namespace StorIA.Core.Application.Validators
{
    /// <summary>
    /// Validator for the RegisterUserRequestDto.
    /// Defines the business rules for creating a new user.
    /// </summary>
    public class RegisterUserRequestDtoValidator : AbstractValidator<RegisterUserRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterUserRequestDtoValidator"/> class,
        /// setting up the validation rules.
        /// </summary>
        public RegisterUserRequestDtoValidator()
        {
            // Rule for the user's full name.
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(250).WithMessage("Full name cannot exceed 250 characters.");

            // Rule for the user's email address.
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("The provided email format is invalid.");

            // Rule for the user's password, enforcing complexity requirements.
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches("[0-9]").WithMessage("Password must contain at least one number.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");

            // Rule for the user's role.
            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("User role is required.")
                .Must(BeAValidRole).WithMessage("The provided role is not valid. Use 'Almoxarife', 'RH', or 'Colaborador'.");
        }

        /// <summary>
        /// Custom validation method to check if the role string
        /// corresponds to a valid UserRole enum value.
        /// </summary>
        /// <param name="role">The role string to be validated.</param>
        /// <returns>True if the role is valid; otherwise, false.</returns>
        private bool BeAValidRole(string role)
        {
            // Enum.TryParse is case-insensitive, which is ideal for an API.
            return Enum.TryParse<UserRole>(role, true, out _);
        }
    }
}