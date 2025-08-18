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

        /// <summary>
        /// Generates a report of items that are set to expire within a specified number of days.
        /// </summary>
        /// <param name="daysUntilExpiration">The number of days from now to check for expiration.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of expiring items as ItemDto.</returns>
        public async Task<IEnumerable<ItemDto>> GetExpiringItemsReportAsync(int daysUntilExpiration)
        {
            // Get the current UTC time to ensure consistency across time zones.
            var today = DateTime.UtcNow;
            // Calculate the future date limit for the expiration check.
            var expirationLimitDate = today.AddDays(daysUntilExpiration);

            // This query retrieves items that have an expiration date
            // that is not null, is after today, and is before the calculated limit date.
            var expiringItems = await _unitOfWork.Items.GetByExpiryDateRangeAsync(today, expirationLimitDate);

            // Map the retrieved entity objects to Data Transfer Objects (DTOs).
            return _mapper.Map<IEnumerable<ItemDto>>(expiringItems);
        }

        /// <summary>
        /// Generates a report of all inventory movements associated with a specific user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of user movements as MovementDto.</returns>
        public async Task<IEnumerable<MovementDto>> GetMovementsByUserReportAsync(Guid userId)
        {
            // Reuses the existing logic from the movement repository to fetch data.
            var movements = await _unitOfWork.Movements.GetByUserIdAsync(userId);

            // Map the retrieved entity objects to Data Transfer Objects (DTOs).
            return _mapper.Map<IEnumerable<MovementDto>>(movements);
        }
    }
}