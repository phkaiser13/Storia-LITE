/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the RegisterMovementRequestDto class, a Data Transfer Object (DTO)
 *   used for registering a new stock movement, such as a dispatch or return.
 *   It encapsulates the necessary data to record the transaction, including which item
 *   was moved, by whom, the quantity, and any relevant notes.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) for the request to register a new stock movement.
    /// </summary>
    public class RegisterMovementRequestDto
    {
        /// <summary>
        /// The ID of the item being moved.
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// The ID of the user (employee) performing the movement.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The number of item units being moved.
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// Optional field for observations about the movement.
        /// (e.g., "Tool returned with minor damage", "Withdrawn for project X").
        /// </summary>
        public string? Observations { get; set; }
    }
}