/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the stock movement management service.
 *   It outlines the business logic for registering item check-ins and check-outs,
 *   as well as retrieving historical movement data for items, users, or the entire system.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the stock movement management service.
    /// </summary>
    public interface IMovementService
    {
        /// <summary>
        /// Registers the checkout of one or more items from the stock to a user.
        /// </summary>
        /// <param name="request">The DTO with the details of the checkout movement.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the DTO of the newly created movement.</returns>
        Task<MovementDto> RegisterCheckoutAsync(RegisterMovementRequestDto request);

        /// <summary>
        /// Registers the return (check-in) of one or more items to the stock by a user.
        /// </summary>
        /// <param name="request">The DTO with the details of the return movement.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the DTO of the newly created movement.</returns>
        Task<MovementDto> RegisterCheckInAsync(RegisterMovementRequestDto request);

        /// <summary>
        /// Gets the movement history for a specific item.
        /// </summary>
        /// <param name="itemId">The ID of the item.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of the item's movement DTOs.</returns>
        Task<IEnumerable<MovementDto>> GetMovementsByItemIdAsync(Guid itemId);

        /// <summary>
        /// Gets the movement history for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a collection of the user's movement DTOs.</returns>
        Task<IEnumerable<MovementDto>> GetMovementsByUserIdAsync(Guid userId);

        /// <summary>
        /// Retrieves a paginated list of all movements in the system.
        /// </summary>
        /// <param name="queryParams">The parameters for searching, sorting, and pagination.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a paginated result of all movement DTOs.</returns>
        Task<PagedResult<MovementDto>> GetAllMovementsAsync(QueryParameters queryParams);
    }
}