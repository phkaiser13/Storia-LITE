/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the ItemDto class, a Data Transfer Object (DTO) that
 *   provides a public representation of a stock item. It is used to transfer
 *   item data between the server and clients, containing all essential details
 *   of an inventory item, such as its identifier, name, stock quantity, and metadata.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) that represents a public view of a stock item.
    /// </summary>
    public class ItemDto
    {
        /// <summary>
        /// The unique identifier for the item.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The name of the item (e.g., "Safety Helmet").
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// A detailed description of the item.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The current quantity of the item in stock.
        /// </summary>
        public int quantity { get; set; }

        /// <summary>
        /// The physical location of the item in the warehouse (e.g., "Aisle 3, Shelf B").
        /// </summary>
        public string location { get; set; }

        /// <summary>
        /// ID of the last user who moved the item.
        /// </summary>
        public string? lastMovedBy { get; set; }

        /// <summary>
        /// The date of the last movement.
        /// </summary>
        public DateTime? lastMovement { get; set; }

        /// <summary>
        /// The expiration date of the item. Can be null.
        /// </summary>
        public DateTime? expirationDate { get; set; }

        /// <summary>
        /// Indicates if the item is a piece of Personal Protective Equipment (PPE).
        /// </summary>
        public bool? isEPI { get; set; }

        /// <summary>
        /// The date for the next scheduled inspection (especially for PPE).
        /// </summary>
        public DateTime? nextInspectionDate { get; set; }

        /// <summary>
        /// The minimum stock level that triggers a reorder suggestion.
        /// </summary>
        public int? minStock { get; set; }

        /// <summary>
        /// The maximum stock level to avoid overstocking.
        /// </summary>
        public int? maxStock { get; set; }

        /// <summary>
        /// Indicates if the item requires periodic maintenance.
        /// </summary>
        public bool? requiresMaintenance { get; set; }

        /// <summary>
        /// The date for the next scheduled maintenance.
        /// </summary>
        public DateTime? nextMaintenanceDate { get; set; }

        /// <summary>
        /// The unit cost of the item, used for financial reports.
        /// </summary>
        public decimal? cost { get; set; }

        // --- Existing properties that are not in the spec but can be useful ---

        /// <summary>
        /// The SKU (Stock Keeping Unit) - a unique code for identifying the item.
        /// </summary>
        public string Sku { get; set; }

        /// <summary>
        /// The category to which the item belongs (e.g., "PPE", "Hand Tool").
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// The date when the item was created in the system.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// The date of the last update to the item's information.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}