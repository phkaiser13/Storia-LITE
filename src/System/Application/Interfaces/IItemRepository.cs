/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the Item repository. It abstracts the
 *   data access logic from the application layer, allowing the persistence
 *   implementation to be swapped without affecting business rules. It includes
 *   methods for CRUD operations, searching, counting, and paginating item data.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Domain.Entities;
using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for an Item repository.
    /// This interface abstracts the data access logic from the application layer,
    /// allowing the persistence implementation to be changed without affecting business rules.
    /// </summary>
    public interface IItemRepository
    {
        /// <summary>
        /// Finds an item by its unique identifier.
        /// </summary>
        /// <param name="id">The ID of the item to find.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the Item object if found; otherwise, null.</returns>
        Task<Item> GetByIdAsync(Guid id);

        /// <summary>
        /// Finds an item by its Stock Keeping Unit (SKU) code.
        /// </summary>
        /// <param name="sku">The SKU of the item to find.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the Item object if found; otherwise, null.</returns>
        Task<Item> GetBySkuAsync(string sku);

        /// <summary>
        /// Retrieves a list of all items in the stock.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of all items.</returns>
        Task<IEnumerable<Item>> GetAllAsync();

        /// <summary>
        /// Retrieves a list of items whose expiration date falls within the specified range.
        /// </summary>
        /// <param name="startDate">The start date of the expiration period.</param>
        /// <param name="endDate">The end date of the expiration period.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of items expiring within the date range.</returns>
        Task<IEnumerable<Item>> GetByExpiryDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Adds a new item to the repository.
        /// </summary>
        /// <param name="item">The Item entity to be added.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddAsync(Item item);

        /// <summary>
        /// Updates an existing item in the repository.
        /// </summary>
        /// <param name="item">The Item entity with updated data.</param>
        void Update(Item item);

        /// <summary>
        /// Removes an item from the repository by its ID.
        /// </summary>
        /// <param name="id">The ID of the item to be removed.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task DeleteAsync(Guid id);

        /// <summary>
        /// Counts the total number of items.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains the total number of items.</returns>
        Task<int> CountAsync();

        /// <summary>
        /// Counts the number of items expiring within a given date range.
        /// </summary>
        /// <param name="startDate">The start date of the range.</param>
        /// <param name="endDate">The end date of the range.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the number of items expiring in the range.</returns>
        Task<int> CountExpiringInRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Retrieves a paginated list of items, applying search filters and sorting.
        /// </summary>
        /// <param name="queryParams">The parameters for searching, sorting, and pagination.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a paged result with the items and pagination metadata.</returns>
        Task<PagedResult<Item>> GetPagedAsync(QueryParameters queryParams);
    }
}