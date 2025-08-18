/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file implements the DashboardService, which is responsible for aggregating
 *   and providing key statistics for the main dashboard view. It efficiently
 *   retrieves data such as total item counts, active users, expiring items,
 *   and daily movements by leveraging parallel asynchronous queries for
 *   optimal performance.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Implements the service that provides data for the Dashboard.
    /// </summary>
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        /// <summary>
        * Initializes a new instance of the<see cref = "DashboardService" /> class.
        * </summary>
        * <param name = "unitOfWork" > The unit of work for accessing repositories.</param>
        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Asynchronously retrieves the core statistics for the application dashboard.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="DashboardStatsDto"/> with the statistics.</returns>
        public async Task<DashboardStatsDto> GetDashboardStatisticsAsync()
        {
            // Define the time periods for the queries.
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);
            var expirationLimitDate = today.AddDays(30);

            // Execute all count queries in parallel to optimize response time.
            var totalItemsTask = _unitOfWork.Items.CountAsync();
            var activeUsersTask = _unitOfWork.Users.CountActiveAsync();
            var expiringItemsTask = _unitOfWork.Items.CountExpiringInRangeAsync(today, expirationLimitDate);
            var movementsTodayTask = _unitOfWork.Movements.CountByDateRangeAsync(today, tomorrow);

            // Await the completion of all concurrent tasks.
            await Task.WhenAll(totalItemsTask, activeUsersTask, expiringItemsTask, movementsTodayTask);

            // Assemble the DTO with the results from the completed tasks.
            var stats = new DashboardStatsDto
            {
                TotalItemsCount = totalItemsTask.Result,
                ActiveUsersCount = activeUsersTask.Result,
                ExpiringIn30DaysCount = expiringItemsTask.Result,
                MovementsTodayCount = movementsTodayTask.Result
            };

            return stats;
        }
    }
}