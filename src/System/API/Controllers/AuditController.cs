/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 *
 * Original Author: Jules Keeper / AI-Assistant
 *
 * Description:
 *   This controller provides an endpoint for retrieving system audit logs.
 *   Access is restricted to users with the HR role.
 *
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StorIA.Core.Application.Interfaces;
using System.Threading.Tasks;

namespace StorIA.API.Controllers
{
    /// <summary>
    /// Controller for retrieving audit logs.
    /// </summary>
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize(Roles = "RH")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        /// <summary>
        /// Retrieves all audit log entries from the system.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllAuditLogs()
        {
            var logs = await _auditService.GetAllAsync();
            return Ok(logs);
        }
    }
}
