/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the validator for the CreateItemRequestDto. It uses
 *   FluentValidation to enforce business rules and data integrity for new
 *   inventory items. It validates required fields, length constraints, and
 *   logical conditions like non-negative stock quantities.
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
    /// Validator for the <see cref="CreateItemRequestDto"/>.
    /// </summary>
    public class CreateItemRequestDtoValidator : AbstractValidator<CreateItemRequestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateItemRequestDtoValidator"/> class,
        /// defining the validation rules for creating a new item.
        /// </summary>
        public CreateItemRequestDtoValidator()
        {
            // Rule for the item's name.
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Item name is required.")
                .MaximumLength(200).WithMessage("Item name cannot exceed 200 characters.");

            // Rule for the item's Stock Keeping Unit (SKU).
            RuleFor(x => x.Sku)
                .NotEmpty().WithMessage("Item SKU is required.")
                .MaximumLength(50).WithMessage("SKU cannot exceed 50 characters.");
            // Note: SKU uniqueness validation is handled in the service layer, as it requires database access.

            // Rule for the item's description.
            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

            // Rule for the item's category.
            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required.")
                .MaximumLength(100).WithMessage("Category cannot exceed 100 characters.");

            // Rule for the item's stock quantity.
            RuleFor(x => x.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be a negative value.");

            // Rule for the item's expiry date.
            RuleFor(x => x.ExpiryDate)
                .GreaterThan(DateTime.UtcNow).When(x => x.ExpiryDate.HasValue)
                .WithMessage("The expiry date, if provided, must be a future date.");
        }
    }
}