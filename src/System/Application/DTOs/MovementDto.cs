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
        /// The ID of the user who registered the movement.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The quantity of items moved. Can be positive (check-in) or negative (check-out).
        /// </summary>
        public int quantity { get; set; }

        /// <summary>
        /// The type of movement ('CHECKIN' or 'CHECKOUT').
        /// </summary>
        public string type { get; set; }

        /// <summary>
        /// The date and time when the movement occurred.
        /// </summary>
        public DateTime date { get; set; }

        /// <summary>
        /// The full Item object, nested for convenience.
        /// </summary>
        public ItemDto? item { get; set; }

        /// <summary>
        /// The full User object of the operator, nested for convenience.
        /// </summary>
        public UserDto? user { get; set; }

        /// <summary>
        /// The ID of the collaborator who received the item (for 'CHECKOUT' of PPE).
        /// </summary>
        public Guid? recipientId { get; set; }

        /// <summary>
        /// The full User object of the recipient, nested for convenience.
        /// </summary>
        public UserDto? recipient { get; set; }

        /// <summary>
        /// The digital signature as a Base64 or Data URL string.
        /// </summary>
        public string? digitalSignature { get; set; }

        /// <summary>
        /// The expected return date for items that are lent (e.g., PPE).
        /// </summary>
        public DateTime? expectedReturnDate { get; set; }

        // --- Existing properties that are not in the spec but can be useful ---

        /// <summary>
        /// Optional observations or notes about the movement.
        /// </summary>
        public string? Observations { get; set; }
    }
}