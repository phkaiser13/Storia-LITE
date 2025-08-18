/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the item management service. It outlines
 *   the business logic operations for handling inventory items, including CRUD 
 *   (Create, Read, Update, Delete) actions and paginated queries.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.DTOs;

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the item management service.
    /// Responsible for the business logic of item CRUD operations.
    /// </summary>
    public interface IItemService
    {
        /// <summary>
        /// Creates a new item in the inventory.
        /// </summary>
        /// <param name="request">The DTO containing the data for the new item.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the DTO of the newly created item.</returns>
        Task<ItemDto> CreateItemAsync(CreateItemRequestDto request);

        /// <summary>
        /// Finds an item by its unique identifier.
        /// </summary>
        /// <param name="id">The ID of the item to retrieve.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the item's DTO if found; otherwise, null.</returns>
        Task<ItemDto> GetItemByIdAsync(Guid id);

        /// <summary>
        /// Retrieves a paginated list of all items in the inventory.
        /// </summary>
        /// <param name="queryParams">The parameters for searching, sorting, and pagination.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a paginated result of all item DTOs.</returns>
        Task<PagedResult<ItemDto>> GetAllItemsAsync(QueryParameters queryParams);

        /// <summary>
        /// Updates the data of an existing item.
        /// </summary>
        /// <param name="id">The ID of the item to be updated.</param>
        /// <param name="request">The DTO with the new data for the item.</param>
        /// <returns>A task that represents the asynchronous operation. The task result is true if the update was successful; otherwise, false if the item was not found.</returns>
        Task<bool> UpdateItemAsync(Guid id, UpdateItemRequestDto request);

        /// <summary>
        /// Removes an item from the inventory.
        /// </summary>
        /// <param name="id">The ID of the item to be removed.</param>
        /// <returns>A task that represents the asynchronous operation. The task result is true if the deletion was successful; otherwise, false if the item was not found.</returns>
        Task<bool> DeleteItemAsync(Guid id);
    }
}