/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the dashboard service. It is responsible
 *   for abstracting the logic required to gather and aggregate data for display
 *   on the main dashboard, such as system-wide statistics and key performance indicators (KPIs).
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the service that provides data for the Dashboard.
    /// </summary>
    public interface IDashboardService
    {
        /// <summary>
        /// Retrieves aggregated statistics for display on the Dashboard.
        /// </summary>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains
        /// a DTO with the system's Key Performance Indicators (KPIs).
        /// </returns>
        Task<DashboardStatsDto> GetDashboardStatisticsAsync();
    }
}