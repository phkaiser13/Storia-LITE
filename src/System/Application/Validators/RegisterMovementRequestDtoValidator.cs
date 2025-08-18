/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the validator for the RegisterMovementRequestDto.
 *   It uses FluentValidation to ensure that data for a new inventory movement
 *   (such as adding or removing stock) is valid before processing. It checks
 *   for required identifiers and logical constraints on the movement quantity.
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
    /// Validator for the <see cref="RegisterMovementRequestDto"/>.
    /// </summary>
    public class RegisterMovementRequestDtoValidator : AbstractValidator<RegisterMovementRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterMovementRequestDtoValidator"/> class,
        /// defining the validation rules for registering an inventory movement.
        /// </summary>
        public RegisterMovementRequestDtoValidator()
        {
            // Rule for the item's unique identifier.
            RuleFor(x => x.ItemId)
                .NotEmpty().WithMessage("The item ID is required.");

            // Rule for the user's unique identifier who is performing the action.
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("The user ID is required.");

            // Rule for the quantity of items being moved.
            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("The quantity must be a positive value.");

            // Rule for any additional observations or notes.
            RuleFor(x => x.Observations)
                .MaximumLength(1000).WithMessage("Observations cannot exceed 1000 characters.");
        }
    }
}