/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 *
 * Original Author: Jules Keeper / AI-Assistant
 *
 * Description:
 *   This interface defines the contract for the audit log service.
 *
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the audit log service.
    /// </summary>
    public interface IAuditService
    {
        /// <summary>
        /// Retrieves all audit log entries.
        /// </summary>
        /// <returns>A collection of all audit log entries.</returns>
        Task<IEnumerable<AuditLogDto>> GetAllAsync();
    }
}
