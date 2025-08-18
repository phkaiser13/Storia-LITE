/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the UpdateItemRequestDto class, a Data Transfer Object (DTO)
 *   used for updating an existing stock item. It includes fields that are typically
 *   editable, such as name, description, and category. Notably, SKU and StockQuantity
 *   are omitted to enforce business rules: SKU should be immutable, and stock levels
 *   should only be changed via explicit stock movements to maintain an accurate audit trail.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) for the request to update an existing item.
    /// </summary>
    public class UpdateItemRequestDto
    {
        /// <summary>
        /// The new name for the item.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The new detailed description for the item.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The new category to which the item belongs.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// The new expiration date for the item.
        /// </summary>
        public DateTime? ExpiryDate { get; set; }

        // Note: SKU and StockQuantity are intentionally omitted.
        // The SKU is an identifier that should not be changed after creation.
        // The stock quantity should only be altered through stock movements
        // (e.g., dispatches and returns), not by direct update, to ensure traceability.
    }
}