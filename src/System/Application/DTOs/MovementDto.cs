/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the MovementDto class, a Data Transfer Object (DTO) used
 *   to represent a historical record of a stock movement. It contains detailed
 *   information about the transaction, including the item involved, the user who
 *   performed the action, the type of movement, and the quantity.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) that represents a historical record of a stock movement.
    /// </summary>
    public class MovementDto
    {
        /// <summary>
        /// The unique identifier for the movement.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The ID of the item that was moved.
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// The name of the moved item.
        /// </summary>
        public string ItemName { get; set; }

        /// <summary>
        /// The SKU of the moved item.
        /// </summary>
        public string ItemSku { get; set; }

        /// <summary>
        /// The ID of the user who performed the movement.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The full name of the user who performed the movement.
        /// </summary>
        public string UserFullName { get; set; }

        /// <summary>
        /// The type of movement (e.g., "Dispatch", "Return").
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// The quantity of items moved.
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// The date and time when the movement occurred.
        /// </summary>
        public DateTime MovementDate { get; set; }

        /// <summary>
        /// Optional observations or notes about the movement.
        /// </summary>
        public string? Observations { get; set; }
    }
}