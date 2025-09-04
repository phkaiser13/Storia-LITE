/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the 'Movement' entity, which represents a single transaction
 *   of an item within the warehouse. It serves as a historical record, linking a user
 *   to an item at a specific point in time. This entity is crucial for auditing,
 *   tracking inventory flow, and maintaining accountability for all stock operations,
 *   such as check-outs and returns.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Domain.Enums;

namespace StorIA.Core.Domain.Entities
{
    /// <summary>
    /// Represents a single transaction involving an item in the warehouse.
    /// This entity provides a historical log connecting a user to an item at a specific moment.
    /// </summary>
    public class Movement
    {
        /// <summary>
        /// Gets the unique identifier for the movement.
        /// </summary>
        public Guid Id { get; private set; }

        /// <summary>
        /// Gets the ID of the item that was moved.
        /// This is a foreign key to the Item entity.
        /// </summary>
        public Guid ItemId { get; private set; }

        /// <summary>
        /// Gets the Item instance associated with this movement.
        /// EF Core will use this navigation property to load the related item data.
        /// </summary>
        public virtual Item Item { get; private set; }

        /// <summary>
        /// Gets the ID of the user (employee) who performed the movement.
        /// This is a foreign key to the User entity.
        /// </summary>
        public Guid UserId { get; private set; }

        /// <summary>
        /// Gets the User instance associated with this movement.
        /// This is a navigation property for EF Core.
        /// </summary>
        public virtual User User { get; private set; }

        /// <summary>
        /// Gets the type of movement (e.g., Checkout or Return).
        /// </summary>
        public MovementType Type { get; private set; }

        /// <summary>
        /// Gets the quantity of items moved in this transaction.
        /// </summary>
        public int Quantity { get; private set; }

        /// <summary>
        /// Gets the date and time when the movement occurred.
        /// </summary>
        public DateTime MovementDate { get; private set; }

        /// <summary>
        /// Gets an optional field for remarks (e.g., "Tool returned with minor damage").
        /// </summary>
        public string Observations { get; private set; }

        /// <summary>
        /// Gets the ID of the user who received the item (for checkouts).
        /// This is a foreign key to the User entity. Can be null for simple stock adjustments.
        /// </summary>
        public Guid? RecipientId { get; private set; }

        /// <summary>
        /// Gets the User instance of the recipient.
        /// This is a navigation property for EF Core.
        /// </summary>
        public virtual User Recipient { get; private set; }

        /// <summary>
        /// Gets the date by which a checked-out item is expected to be returned.
        /// </summary>
        public DateTime? ExpectedReturnDate { get; private set; }

        /// <summary>
        /// Gets the digital signature captured upon checkout, stored as a data URL.
        /// </summary>
        public string DigitalSignature { get; private set; }

        // Private parameterless constructor for ORM frameworks like EF Core.
        private Movement() { }

        /// <summary>
        /// Initializes a new instance of the <see cref="Movement"/> class to record a new transaction.
        /// </summary>
        /// <param name="itemId">The ID of the item being moved.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <param name="type">The type of movement (Checkout/Return).</param>
        /// <param name="quantity">The quantity of items moved.</param>
        /// <param name="observations">Optional observations about the transaction.</param>
        public Movement(Guid itemId, Guid userId, MovementType type, int quantity, string observations = null)
        {
            Id = Guid.NewGuid();
            ItemId = itemId;
            UserId = userId;
            Type = type;
            Quantity = quantity;
            MovementDate = DateTime.UtcNow;
            Observations = observations;

            Validate();
        }

        /// <summary>
        /// Validates the entity's state to ensure data consistency.
        /// </summary>
        /// <exception cref="ArgumentException">Thrown if validation fails.</exception>
        private void Validate()
        {
            if (ItemId == Guid.Empty)
                throw new ArgumentException("The item ID cannot be empty.");
            if (UserId == Guid.Empty)
                throw new ArgumentException("The user ID cannot be empty.");
            if (Quantity <= 0)
                throw new ArgumentException("The moved quantity must be a positive value.");
        }
    }
}