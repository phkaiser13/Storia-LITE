/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the 'Item' entity, which is a core component of the domain model.
 *   It represents a physical item within a warehouse or inventory system, such as a tool,
 *   PPE (Personal Protective Equipment), or consumable material. The class encapsulates
 *   properties like SKU, quantity, and category, along with essential business logic for
 *   managing stock levels and checking for expiration. It is designed as a Domain-Driven
 *   Design (DDD) aggregate root.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Domain.Entities
{
    /// <summary>
    /// Represents a physical item in the warehouse, such as a tool, PPE, or consumable material.
    /// This is a root entity in our domain.
    /// </summary>
    public class Item
    {
        /// <summary>
        /// Gets the unique identifier for the item. We use Guid to ensure uniqueness in distributed environments.
        /// </summary>
        public Guid Id { get; private set; }

        /// <summary>
        /// Gets the name of the item (e.g., "V-Gard Safety Helmet").
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Gets the detailed description of the item.
        /// </summary>
        public string Description { get; private set; }

        /// <summary>
        /// Gets the SKU (Stock Keeping Unit) - a unique code for identifying the product in stock.
        /// </summary>
        public string Sku { get; private set; }

        /// <summary>
        /// Gets the current quantity of the item in stock.
        /// </summary>
        public int Quantity { get; private set; }

        /// <summary>
        /// Gets or sets the stock quantity. This property might be used for data binding or specific framework requirements.
        /// </summary>
        public int StockQuantity { get; set; }

        /// <summary>
        /// Gets the category of the item (e.g., "PPE", "Power Tool", "Office Supplies").
        /// </summary>
        public string Category { get; private set; }

        /// <summary>
        /// Gets the expiration date of the item, which is crucial for perishable goods or PPE. Can be null for non-perishable items.
        /// </summary>
        public DateTime? ExpiryDate { get; private set; }

        /// <summary>
        /// Gets the date and time when the item record was created.
        /// </summary>
        public DateTime CreatedAt { get; private set; }

        /// <summary>
        /// Gets the date and time of the last update to the item record.
        /// </summary>
        public DateTime? UpdatedAt { get; private set; }

        /// <summary>
        /// Gets the unit cost of the item. Can be null if not applicable.
        /// </summary>
        public decimal? Cost { get; private set; }

        // Private parameterless constructor for ORM frameworks like EF Core.
        private Item() { }

        /// <summary>
        /// Initializes a new instance of the <see cref="Item"/> class.
        /// </summary>
        /// <param name="name">The name of the item.</param>
        /// <param name="description">The detailed description of the item.</param>
        /// <param name="sku">The Stock Keeping Unit (SKU).</param>
        /// <param name="initialQuantity">The initial quantity in stock.</param>
        /// <param name="category">The item's category.</param>
        /// <param name="expiryDate">The expiration date, if applicable.</param>
        public Item(string name, string description, string sku, int initialQuantity, string category, DateTime? expiryDate)
        {
            Id = Guid.NewGuid();
            Name = name;
            Description = description;
            Sku = sku;
            Quantity = initialQuantity;
            Category = category;
            ExpiryDate = expiryDate;
            CreatedAt = DateTime.UtcNow;

            Validate();
        }

        /// <summary>
        /// Increases the item's stock quantity.
        /// </summary>
        /// <param name="amount">The amount to add. This value must be positive.</param>
        /// <exception cref="ArgumentException">Thrown when the amount is not positive.</exception>
        public void IncreaseStock(int amount)
        {
            if (amount <= 0)
            {
                throw new ArgumentException("The amount to increase stock must be positive.", nameof(amount));
            }
            Quantity += amount;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Decreases the item's stock quantity. This is a critical business rule.
        /// </summary>
        /// <param name="amount">The amount to remove. This value must be positive.</param>
        /// <exception cref="ArgumentException">Thrown when the amount is not positive.</exception>
        /// <exception cref="InvalidOperationException">Thrown when there is insufficient stock to perform the operation.</exception>
        public void DecreaseStock(int amount)
        {
            if (amount <= 0)
            {
                throw new ArgumentException("The amount to decrease stock must be positive.", nameof(amount));
            }
            if (Quantity < amount)
            {
                throw new InvalidOperationException("Insufficient stock to perform the withdrawal.");
            }
            Quantity -= amount;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Checks if the item has expired based on its ExpiryDate.
        /// </summary>
        /// <returns>True if the expiration date has passed; otherwise, false.</returns>
        public bool IsExpired()
        {
            return ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
        }

        /// <summary>
        /// Validates the entity's state to ensure data consistency.
        /// </summary>
        /// <exception cref="ArgumentException">Thrown if validation fails.</exception>
        private void Validate()
        {
            if (string.IsNullOrWhiteSpace(Name))
                throw new ArgumentException("Item name cannot be empty.");
            if (string.IsNullOrWhiteSpace(Sku))
                throw new ArgumentException("Item SKU cannot be empty.");
            if (Quantity < 0)
                throw new ArgumentException("Stock quantity cannot be negative.");
        }
    }
}