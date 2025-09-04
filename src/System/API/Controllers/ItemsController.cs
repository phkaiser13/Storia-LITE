/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   Defines the API controller for managing inventory items. This controller handles
 *   all CRUD (Create, Read, Update, Delete) operations for items, including
 *   paginated listing, searching, and role-based authorization for specific actions.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace StorIA.API.Controllers
{
    /// <summary>
    /// API controller for managing CRUD operations for inventory items.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Secures all endpoints in this controller. Only authenticated users can access them.
    public class ItemsController : ControllerBase
    {
        // Private read-only field to hold the item service instance.
        private readonly IItemService _itemService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ItemsController"/> class.
        /// </summary>
        /// <param name="itemService">The item service dependency, injected by the framework.</param>
        public ItemsController(IItemService itemService)
        {
            _itemService = itemService;
        }

        /// <summary>
        /// Creates a new item in the inventory.
        /// </summary>
        /// <param name="request">The data transfer object containing the new item's details.</param>
        /// <returns>An IActionResult indicating the result of the creation operation.</returns>
        [HttpPost]
        [Authorize(Roles = "Almoxarife,RH")] // Only users with 'Almoxarife' or 'RH' roles can create items.
        [ProducesResponseType(typeof(ItemDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CreateItem([FromBody] CreateItemRequestDto request)
        {
            try
            {
                // Attempt to create the new item via the service layer.
                var newItem = await _itemService.CreateItemAsync(request);
                // Return a 201 Created response with the location of the new resource.
                return CreatedAtAction(nameof(GetItemById), new { id = newItem.Id }, newItem);
            }
            catch (ValidationException ex)
            {
                // Handle specific validation conflicts, e.g., an item with the same name already exists.
                return Conflict(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves a specific item by its unique identifier (ID).
        /// </summary>
        /// <param name="id">The GUID of the item to retrieve.</param>
        /// <returns>The requested item if found; otherwise, a 404 Not Found response.</returns>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetItemById(Guid id)
        {
            var item = await _itemService.GetItemByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item);
        }

        /// <summary>
        /// Retrieves a paginated list of inventory items, with support for searching and sorting.
        /// </summary>
        /// <param name="queryParams">Parameters for pagination, searching, and sorting.</param>
        /// <remarks>
        /// Example usage: GET /api/items?pageNumber=1&pageSize=10&searchTerm=helmet&sortBy=name&sortOrder=desc
        /// </remarks>
        /// <returns>A paginated result of item data transfer objects.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<ItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllItems([FromQuery] QueryParameters queryParams)
        {
            var pagedResult = await _itemService.GetAllItemsAsync(queryParams);
            return Ok(pagedResult);
        }

        /// <summary>
        /// Updates an existing item's data.
        /// </summary>
        /// <param name="id">The GUID of the item to update.</param>
        /// <param name="request">The data transfer object with the updated item details.</param>
        /// <returns>A 204 No Content response if successful; otherwise, a 404 Not Found response.</returns>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Almoxarife,RH")] // Only users with 'Almoxarife' or 'RH' roles can update items.
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateItemRequestDto request)
        {
            var success = await _itemService.UpdateItemAsync(id, request);
            if (!success)
            {
                return NotFound();
            }
            return NoContent(); // 204 No Content is the standard response for a successful PUT/PATCH operation.
        }

        /// <summary>
        /// Deletes an item from the inventory.
        /// </summary>
        /// <param name="id">The GUID of the item to delete.</param>
        /// <returns>A 204 No Content response if successful; otherwise, a relevant error response.</returns>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Almoxarife,RH")] // Both Warehouse Managers and HR can delete items.
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteItem(Guid id)
        {
            try
            {
                var success = await _itemService.DeleteItemAsync(id);
                if (!success)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (ValidationException ex)
            {
                // Handle conflicts, e.g., trying to delete an item that is currently in use.
                return Conflict(new { message = ex.Message });
            }
        }
    }
}