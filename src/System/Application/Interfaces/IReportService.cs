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
        Task<IEnumerable<ItemDto>> GetExpiringItemsAsync(int daysUntilExpiration);

        /// <summary>
        /// Gets a list of checkout movements for which the expected return date has passed.
        /// </summary>
        /// <returns>A collection of overdue movement records.</returns>
        Task<IEnumerable<MovementDto>> GetOverdueReturnsAsync();

        /// <summary>
        /// Calculates the total cost of items dispatched, grouped by the recipient's cost center, within a date range.
        /// </summary>
        /// <param name="fromDate">The start date of the reporting period.</param>
        /// <param name="toDate">The end date of the reporting period.</param>
        /// <returns>A collection of DTOs, each representing the total cost for a specific cost center.</returns>
        Task<IEnumerable<CostByCenterDto>> GetCostByCenterAsync(DateTime fromDate, DateTime toDate);
    }
}