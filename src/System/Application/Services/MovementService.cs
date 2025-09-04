/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file implements the MovementService, which is responsible for handling
 *   the business logic related to stock movements. It provides functionalities
 *   for registering item check-ins (stock increase) and check-outs (stock decrease),
 *   ensuring data integrity and applying business rules such as stock availability checks.
 *   It also offers methods to retrieve movement history.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using AutoMapper;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Domain.Entities;
using StorIA.Core.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Implements the service for managing stock movements.
    /// </summary>
    public class MovementService : IMovementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="MovementService"/> class.
        /// </summary>
        /// <param name="unitOfWork">The unit of work for database operations.</param>
        /// <param name="mapper">The AutoMapper instance for DTO mapping.</param>
        public MovementService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Registers a stock checkout (decrease) movement.
        /// </summary>
        /// <param name="request">The DTO containing the details for the checkout.</param>
        /// <returns>A DTO representing the created movement record.</returns>
        /// <exception cref="ValidationException">Thrown if the item or user is not found, or if there is insufficient stock.</exception>
        public async Task<MovementDto> RegisterCheckoutAsync(RegisterMovementRequestDto request)
        {
            // 1. Validate if the item and user exist.
            var item = await _unitOfWork.Items.GetByIdAsync(request.ItemId);
            if (item == null)
                throw new ValidationException("The specified item was not found.");

            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
            if (user == null)
                throw new ValidationException("The specified user was not found.");

            // 2. CRITICAL business rule: Verify if there is sufficient stock.
            if (item.StockQuantity < request.Quantity)
                throw new ValidationException($"Insufficient stock for item '{item.Name}'. Available: {item.StockQuantity}, Requested: {request.Quantity}.");

            // 3. Execute the domain operation to decrease stock.
            item.DecreaseStock(request.Quantity);

            // 4. Create the historical movement record.
            var movement = new Movement(item.Id, user.Id, MovementType.Saida, request.Quantity, request.Observations);
            await _unitOfWork.Movements.AddAsync(movement);

            // 5. Persist all changes (item update and movement creation) in a single transaction.
            await _unitOfWork.CompleteAsync();

            // 6. Map the entity to a DTO and return the result.
            return _mapper.Map<MovementDto>(movement);
        }

        /// <summary>
        /// Registers a stock check-in (increase) movement.
        /// </summary>
        /// <param name="request">The DTO containing the details for the check-in.</param>
        /// <returns>A DTO representing the created movement record.</returns>
        /// <exception cref="ValidationException">Thrown if the item or user is not found.</exception>
        public async Task<MovementDto> RegisterCheckInAsync(RegisterMovementRequestDto request)
        {
            // 1. Validate if the item and user exist.
            var item = await _unitOfWork.Items.GetByIdAsync(request.ItemId);
            if (item == null)
                throw new ValidationException("The specified item was not found.");

            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
            if (user == null)
                throw new ValidationException("The specified user was not found.");

            // 2. Execute the domain operation to increase stock.
            item.IncreaseStock(request.Quantity);

            // 3. Create the historical movement record.
            var movement = new Movement(item.Id, user.Id, MovementType.Devolucao, request.Quantity, request.Observations);
            await _unitOfWork.Movements.AddAsync(movement);

            // 4. Persist all changes in a single transaction.
            await _unitOfWork.CompleteAsync();

            // 5. Map the entity to a DTO and return the result.
            return _mapper.Map<MovementDto>(movement);
        }

        /// <summary>
        /// Retrieves all movement records for a specific item.
        /// </summary>
        /// <param name="itemId">The unique identifier of the item.</param>
        /// <returns>An enumerable collection of movement DTOs.</returns>
        public async Task<IEnumerable<MovementDto>> GetMovementsByItemIdAsync(Guid itemId)
        {
            var movements = await _unitOfWork.Movements.GetByItemIdAsync(itemId);
            return _mapper.Map<IEnumerable<MovementDto>>(movements);
        }

        /// <summary>
        /// Retrieves all movement records initiated by a specific user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>An enumerable collection of movement DTOs.</returns>
        public async Task<IEnumerable<MovementDto>> GetMovementsByUserIdAsync(Guid userId)
        {
            var movements = await _unitOfWork.Movements.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<MovementDto>>(movements);
        }

        /// <summary>
        /// Retrieves a paginated list of all movement records.
        /// </summary>
        /// <param name="queryParams">The parameters for pagination and filtering.</param>
        /// <returns>A paged result containing movement DTOs and pagination metadata.</returns>
        public async Task<PagedResult<MovementDto>> GetAllMovementsAsync(QueryParameters queryParams)
        {
            // 1. Call the repository method to get the paged result of the entity.
            var pagedMovements = await _unitOfWork.Movements.GetPagedAsync(queryParams);

            // 2. Map the list of entities (Movement) to a list of DTOs (MovementDto).
            var movementsDto = _mapper.Map<IEnumerable<MovementDto>>(pagedMovements.Items);

            // 3. Create a new PagedResult of type MovementDto, 
            //    passing along the pagination metadata from the original result.
            return new PagedResult<MovementDto>(
                movementsDto,
                pagedMovements.TotalCount,
                pagedMovements.PageNumber,
                pagedMovements.PageSize
            );
        }

        /// <inheritdoc />
        public async Task<MovementDto> GetMovementByIdAsync(Guid id)
        {
            var movement = await _unitOfWork.Movements.GetByIdAsync(id);
            return _mapper.Map<MovementDto>(movement);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MovementDto>> GetMovementsByRecipientIdAsync(Guid recipientId)
        {
            // This assumes a method GetByRecipientIdAsync exists on the repository.
            // If not, it would need to be added to IMovementRepository and its implementation.
            var movements = await _unitOfWork.Movements.Find(m => m.RecipientId == recipientId);
            return _mapper.Map<IEnumerable<MovementDto>>(movements);
        }
    }
}