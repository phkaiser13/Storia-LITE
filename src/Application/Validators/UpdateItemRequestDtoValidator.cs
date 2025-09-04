/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the validator for the UpdateItemRequestDto. It uses FluentValidation
 *   to define the rules for updating an existing inventory item. The validation ensures
 *   that the provided data for Name, Description, Category, and ExpiryDate meets the
 *   required business constraints before processing the update request.
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
    /// Validator for the DTO used in item update requests.
    /// </summary>
    public class UpdateItemRequestDtoValidator : AbstractValidator<UpdateItemRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateItemRequestDtoValidator"/> class,
        /// configuring the validation rules for updating an item.
        /// </summary>
        public UpdateItemRequestDtoValidator()
        {
            // Rule for the item's name.
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Item name is required.")
                .MaximumLength(200).WithMessage("Item name cannot exceed 200 characters.");

            // Rule for the item's description.
            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

            // Rule for the item's category.
            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required.")
                .MaximumLength(100).WithMessage("Category cannot exceed 100 characters.");

            // Rule for the item's expiry date.
            // This rule is conditional: it only applies if an ExpiryDate is provided.
            RuleFor(x => x.ExpiryDate)
                .GreaterThan(DateTime.UtcNow).When(x => x.ExpiryDate.HasValue)
                .WithMessage("The expiry date, if provided, must be a future date.");
        }
    }
}