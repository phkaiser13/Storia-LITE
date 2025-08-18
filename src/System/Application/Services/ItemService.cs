/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the implementation of the ItemService, which handles the
 *   business logic for managing inventory items (Products). It implements the
 *   IItemService interface and provides CRUD (Create, Read, Update, Delete)
 *   operations. The service utilizes the Unit of Work pattern for transactional
 *   database operations and AutoMapper for object-to-object mapping between
 *   DTOs and domain entities.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Implements the service for managing items.
    /// </summary>
    public class ItemService : IItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="ItemService"/> class.
        /// </summary>
        /// <param name="unitOfWork">The unit of work for database operations.</param>
        /// <param name="mapper">The AutoMapper instance for object mapping.</param>
        public ItemService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        /// <summary>
        /// Creates a new item asynchronously.
        /// </summary>
        /// <param name="request">The DTO containing the data for the new item.</param>
        /// <returns>A DTO representing the newly created item.</returns>
        /// <exception cref="ValidationException">Thrown if an item with the same SKU already exists.</exception>
        public async Task<ItemDto> CreateItemAsync(CreateItemRequestDto request)
        {
            // Business rule: Check if the SKU already exists.
            var existingItem = await _unitOfWork.Items.GetBySkuAsync(request.Sku);
            if (existingItem != null)
            {
                throw new ValidationException("An item with this SKU already exists.");
            }

            // Maps the request DTO to the domain entity.
            var newItem = _mapper.Map<Item>(request);

            await _unitOfWork.Items.AddAsync(newItem);
            await _unitOfWork.CompleteAsync();

            // Maps the newly created entity (now with an ID) to the response DTO.
            return _mapper.Map<ItemDto>(newItem);
        }

        /// <summary>
        /// Retrieves an item by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the item.</param>
        /// <returns>A DTO representing the found item, or null if not found.</returns>
        public async Task<ItemDto> GetItemByIdAsync(Guid id)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(id);
            return _mapper.Map<ItemDto>(item); // AutoMapper handles the case where the item is null.
        }

        /// <summary>
        /// Retrieves a paginated list of all items.
        /// </summary>
        /// <param name="queryParams">The parameters for filtering and pagination.</param>
        /// <returns>A paged result containing the list of item DTOs and pagination metadata.</returns>
        public async Task<PagedResult<ItemDto>> GetAllItemsAsync(QueryParameters queryParams)
        {
            // 1. Call the repository's method to get the paginated result of the entity.
            var pagedItems = await _unitOfWork.Items.GetPagedAsync(queryParams);

            // 2. Map the list of entities (Item) to a list of DTOs (ItemDto).
            var itemsDto = _mapper.Map<IEnumerable<ItemDto>>(pagedItems.Items);

            // 3. Create a new PagedResult, but of type ItemDto,
            //    passing on the pagination metadata from the original result.
            return new PagedResult<ItemDto>(
                itemsDto,
                pagedItems.TotalCount,
                pagedItems.PageNumber,
                pagedItems.PageSize
            );
        }

        /// <summary>
        /// Updates an existing item asynchronously.
        /// </summary>
        /// <param name="id">The unique identifier of the item to update.</param>
        /// <param name="request">The DTO containing the updated data.</param>
        /// <returns>True if the update was successful, false if the item was not found.</returns>
        public async Task<bool> UpdateItemAsync(Guid id, UpdateItemRequestDto request)
        {
            var existingItem = await _unitOfWork.Items.GetByIdAsync(id);
            if (existingItem == null)
            {
                return false; // Item not found.
            }

            // Maps the data from the DTO to the existing entity.
            // AutoMapper will only update the properties present in the DTO.
            _mapper.Map(request, existingItem);

            // EF Core tracks the change, and the UnitOfWork will commit it.
            await _unitOfWork.CompleteAsync();
            return true;
        }

        /// <summary>
        /// Deletes an item asynchronously.
        /// </summary>
        /// <param name="id">The unique identifier of the item to delete.</param>
        /// <returns>True if the deletion was successful, false if the item was not found.</returns>
        /// <exception cref="ValidationException">Thrown if the item cannot be deleted due to existing movement history.</exception>
        public async Task<bool> DeleteItemAsync(Guid id)
        {
            // First, we need to ensure the item exists before attempting to delete.
            var item = await _unitOfWork.Items.GetByIdAsync(id);
            if (item == null)
            {
                return false; // Item not found.
            }

            try
            {
                await _unitOfWork.Items.DeleteAsync(id);
                await _unitOfWork.CompleteAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                // Catches the foreign key violation exception from the database.
                // This occurs if we try to delete an item that has associated movements.
                throw new ValidationException("This item cannot be deleted because it has a movement history.");
            }
        }
    }
}