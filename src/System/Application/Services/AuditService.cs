/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 *
 * Original Author: Jules Keeper / AI-Assistant
 *
 * Description:
 *   This service implements the IAuditService for retrieving audit log data.
 *
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using AutoMapper;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Implements the service for retrieving audit logs.
    /// </summary>
    public class AuditService : IAuditService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AuditService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AuditLogDto>> GetAllAsync()
        {
            // This assumes the UnitOfWork has a repository for AuditLogs
            // and that the repository has a GetAllAsync method.
            var auditLogs = await _unitOfWork.AuditLogs.GetAllAsync();
            return _mapper.Map<IEnumerable<AuditLogDto>>(auditLogs);
        }
    }
}
