/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the report generation service. It provides
 *   methods for creating specific reports, such as lists of expiring items or user
 *   activity logs, which are essential for inventory management and auditing.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the report generation service.
    /// </summary>
    public interface IReportService
    {
        /// <summary>
        /// Generates a report of items with an upcoming expiration date.
        /// </summary>
        /// <param name="daysUntilExpiration">
        /// The number of days from today to check for expiration. 
        /// Items expiring between today and today + daysUntilExpiration will be returned.
        /// </param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of DTOs for items that are about to expire.</returns>
        Task<IEnumerable<ItemDto>> GetExpiringItemsReportAsync(int daysUntilExpiration);

        /// <summary>
        /// Generates a report of all movements made by a specific user.
        /// (Note: This method is effectively covered by IMovementService but can be centralized here for clarity).
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of the user's movement DTOs.</returns>
        Task<IEnumerable<MovementDto>> GetMovementsByUserReportAsync(Guid userId);
    }
}