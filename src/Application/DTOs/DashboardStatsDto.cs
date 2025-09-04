/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the DashboardStatsDto class, a Data Transfer Object (DTO)
 *   designed to encapsulate aggregated statistics for the main dashboard. It provides
 *   a summary of key metrics like total items, active users, expiring products,
 *   and recent stock movements.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// DTO that encapsulates aggregated statistics for the Dashboard.
    /// </summary>
    public class DashboardStatsDto
    {
        /// <summary>
        /// The total count of distinct items registered in the inventory.
        /// </summary>
        public int TotalItemsCount { get; set; }

        /// <summary>
        /// The total number of active users in the system.
        /// </summary>
        public int ActiveUsersCount { get; set; }

        /// <summary>
        /// The number of items that will expire within the next 30 days.
        /// </summary>
        public int ExpiringIn30DaysCount { get; set; }

        /// <summary>
        /// The total number of stock movements (e.g., dispatches, returns) recorded today.
        /// </summary>
        public int MovementsTodayCount { get; set; }
    }
}