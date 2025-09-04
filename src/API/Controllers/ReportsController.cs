/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the API controller responsible for handling business report generation.
 *   It provides endpoints for retrieving data such as items nearing their expiration date
 *   and the movement history for a specific user. Access to these reports is restricted
 *   to users with specific roles (e.g., Human Resources).
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
    /// Controller for generating business reports.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "RH")] // Only users with the "RH" (HR) role can access these reports.
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReportsController"/> class.
        /// </summary>
        /// <param name="reportService">The report service dependency, injected by the framework.</param>
        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// Generates a report of items with an upcoming expiration date.
        /// </summary>
        /// <param name="days">The number of days from today to check for expiration. The default is 30.</param>
        /// <returns>A list of items that are about to expire.</returns>
        [HttpGet("expiring-items")]
        [ProducesResponseType(typeof(IEnumerable<ItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetExpiringItems([FromQuery] int days = 30)
        {
            var reportData = await _reportService.GetExpiringItemsReportAsync(days);
            return Ok(reportData);
        }

        /// <summary>
        /// Generates a report of all movements for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user for whom the report will be generated.</param>
        /// <returns>The movement history for the specified user.</returns>
        [HttpGet("movements-by-user/{userId:guid}")]
        [ProducesResponseType(typeof(IEnumerable<MovementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMovementsByUser(Guid userId)
        {
            var reportData = await _reportService.GetMovementsByUserReportAsync(userId);
            return Ok(reportData);
        }
    }
}