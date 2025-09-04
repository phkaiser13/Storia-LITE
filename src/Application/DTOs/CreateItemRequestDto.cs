/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the CreateItemRequestDto class, a Data Transfer Object (DTO)
 *   used for creating a new stock item. It encapsulates all the necessary information
 *   required to add a new product to the inventory, such as its name, SKU,
 *   description, category, initial quantity, and an optional expiry date.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) for the request to create a new stock item.
    /// </summary>
    public class CreateItemRequestDto
    {
        /// <summary>
        /// The name of the item.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The SKU (Stock Keeping Unit) of the item.
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// A detailed description of the item.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The category to which the item belongs.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// The initial quantity of the item in stock.
        /// </summary>
        public int StockQuantity { get; set; }

        /// <summary>
        /// The expiration date of the item. This field is optional.
        /// </summary>
        public DateTime? ExpiryDate { get; set; }
    }
}