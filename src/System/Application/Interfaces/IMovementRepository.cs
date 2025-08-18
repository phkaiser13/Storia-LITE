/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the Movement repository. It focuses on
 *   adding new records and querying historical data, reflecting the immutable log
 *   nature of inventory movements. This abstraction is crucial for tracking item
 *   history, user actions, and generating reports.
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
    /// Defines the contract for a Movement repository.
    /// This interface focuses on adding new records and querying historical data,
    /// reflecting the immutable log nature of movements.
    /// </summary>
    public interface IMovementRepository
    {
        /// <summary>
        /// Finds a movement by its unique identifier.
        /// </summary>
        /// <param name="id">The ID of the movement to find.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the Movement object if found; otherwise, null.</returns>
        Task<Movement> GetByIdAsync(Guid id);

        /// <summary>
        /// Adds a new movement record to the repository.
        /// </summary>
        /// <param name="movement">The Movement entity to be added.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddAsync(Movement movement);

        /// <summary>
        /// Retrieves all movement records for a specific item.
        /// Useful for tracking the complete history of an item.
        /// </summary>
        /// <param name="itemId">The ID of the item.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of movements for the specified item.</returns>
        Task<IEnumerable<Movement>> GetByItemIdAsync(Guid itemId);

        /// <summary>
        /// Retrieves all movement records for a specific user.
        /// Useful for auditing and for seeing what an employee has in their possession.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of movements for the specified user.</returns>
        Task<IEnumerable<Movement>> GetByUserIdAsync(Guid userId);

        /// <summary>
        /// Retrieves all movement records within a date range.
        /// Essential for generating reports.
        /// </summary>
        /// <param name="startDate">The start date of the period.</param>
        /// <param name="endDate">The end date of the period.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of movements within the date range.</returns>
        Task<IEnumerable<Movement>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Counts the number of movements within a given date range.
        /// </summary>
        /// <param name="startDate">The start date of the range.</param>
        /// <param name="endDate">The end date of the range.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the number of movements in the range.</returns>
        Task<int> CountByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Retrieves a paginated list of movements, applying search filters and sorting.
        /// </summary>
        /// <param name="queryParams">The parameters for searching, sorting, and pagination.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a paged result with the movements and pagination metadata.</returns>
        Task<PagedResult<Movement>> GetPagedAsync(QueryParameters queryParams);
    }
}