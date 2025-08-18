/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   Defines the API controller for the application's dashboard. This controller
 *   exposes endpoints to retrieve aggregated statistics and key performance
 *   indicators (KPIs) required for the dashboard's user interface.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;

namespace StorIA.API.Controllers
{
    /// <summary>
    /// API controller responsible for providing aggregated data for the application's dashboard.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Ensures that only authenticated users can access the dashboard endpoints.
    public class DashboardController : ControllerBase
    {
        // Private read-only field to hold the dashboard service instance.
        private readonly IDashboardService _dashboardService;

        /// <summary>
        /// Initializes a new instance of the <see cref="DashboardController"/> class.
        /// </summary>
        /// <param name="dashboardService">The dashboard service dependency, injected by the framework.</param>
        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Retrieves the main system statistics for the dashboard.
        /// </summary>
        /// <returns>An IActionResult containing the <see cref="DashboardStatsDto"/> with system KPIs.</returns>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStatistics()
        {
            // Asynchronously call the service layer to get dashboard statistics.
            var stats = await _dashboardService.GetDashboardStatisticsAsync();

            // Return the statistics in an HTTP 200 OK response.
            return Ok(stats);
        }
    }
}