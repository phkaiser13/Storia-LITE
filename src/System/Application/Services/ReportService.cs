/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file implements the ReportService, which is responsible for generating
 *   various business reports for the application. It handles the logic for
 *   retrieving and processing data for reports such as expiring items and
 *   user-specific inventory movements.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using AutoMapper;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Implements the IReportService interface to provide report generation functionalities.
    /// </summary>
    public class ReportService : IReportService
    {
        // Dependency for data access operations.
        private readonly IUnitOfWork _unitOfWork;
        // Dependency for object-to-object mapping.
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReportService"/> class.
        /// </summary>
        /// <param name="unitOfWork">The unit of work for accessing repositories.</param>
        /// <param name="mapper">The AutoMapper instance for DTO mapping.</param>
        public ReportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ItemDto>> GetExpiringItemsAsync(int daysUntilExpiration)
        {
            var today = System.DateTime.UtcNow;
            var expirationLimitDate = today.AddDays(daysUntilExpiration);

            var expiringItems = await _unitOfWork.Items.Find(i => i.ExpiryDate != null && i.ExpiryDate > today && i.ExpiryDate <= expirationLimitDate);

            return _mapper.Map<IEnumerable<ItemDto>>(expiringItems);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MovementDto>> GetOverdueReturnsAsync()
        {
            var today = System.DateTime.UtcNow;

            var overdueMovements = await _unitOfWork.Movements.Find(
                m => m.Type == MovementType.Saida && m.ExpectedReturnDate != null && m.ExpectedReturnDate < today
            );

            return _mapper.Map<IEnumerable<MovementDto>>(overdueMovements);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<CostByCenterDto>> GetCostByCenterAsync(System.DateTime fromDate, System.DateTime toDate)
        {
            var movements = await _unitOfWork.Movements.Find(
                m => m.Type == MovementType.Saida && m.MovementDate >= fromDate && m.MovementDate <= toDate,
                includes: new[] { "Item", "Recipient" }
            );

            var costByCenter = movements
                .Where(m => m.Recipient?.CostCenter != null && m.Item?.Cost != null)
                .GroupBy(m => m.Recipient.CostCenter)
                .Select(group => new CostByCenterDto
                {
                    costCenter = group.Key,
                    totalCost = group.Sum(m => m.Quantity * m.Item.Cost.Value),
                    movements = _mapper.Map<List<MovementDto>>(group.ToList())
                })
                .ToList();

            return costByCenter;
        }
    }
}