/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   Defines the API controller for managing stock movements. This controller
 *   handles the registration of item check-ins and check-outs, and provides
 *   endpoints to retrieve movement history by item, user, or through a
 *   paginated list. Access is restricted by user roles.
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
    /// API controller for managing inventory movement operations.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Almoxarife")] // Restricts access to this controller to users with 'Almoxarife' role.
    public class MovementsController : ControllerBase
    {
        private readonly IMovementService _movementService;

        /// <summary>
        /// Initializes a new instance of the <see cref="MovementsController"/> class.
        /// </summary>
        /// <param name="movementService">The movement service dependency, injected by the framework.</param>
        public MovementsController(IMovementService movementService)
        {
            _movementService = movementService;
        }

        /// <summary>
        /// Registers the checkout (dispatch) of an item from the inventory.
        /// </summary>
        /// <param name="request">The data transfer object containing the movement details.</param>
        /// <returns>An IActionResult with the newly created movement's data.</returns>
        [HttpPost("checkout")]
        [ProducesResponseType(typeof(MovementDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If the item or user is not found.
        public async Task<IActionResult> RegisterCheckout([FromBody] RegisterMovementRequestDto request)
        {
            try
            {
                var newMovement = await _movementService.RegisterCheckoutAsync(request);
                return CreatedAtAction(nameof(GetMovementById), new { id = newMovement.Id }, newMovement);
            }
            catch (ValidationException ex)
            {
                // Returns a 400 Bad Request for validation errors (e.g., insufficient stock).
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Registers the check-in (return) of an item to the inventory.
        /// </summary>
        /// <param name="request">The data transfer object containing the movement details.</param>
        /// <returns>An IActionResult with the newly created movement's data.</returns>
        [HttpPost("checkin")]
        [ProducesResponseType(typeof(MovementDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RegisterCheckIn([FromBody] RegisterMovementRequestDto request)
        {
            try
            {
                var newMovement = await _movementService.RegisterCheckInAsync(request);
                return CreatedAtAction(nameof(GetMovementById), new { id = newMovement.Id }, newMovement);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves the movement history for a specific item.
        /// </summary>
        /// <param name="itemId">The GUID of the item.</param>
        /// <returns>A list of movements associated with the specified item.</returns>
        [HttpGet("item/{itemId:guid}")]
        [ProducesResponseType(typeof(IEnumerable<MovementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMovementsByItem(Guid itemId)
        {
            var movements = await _movementService.GetMovementsByItemIdAsync(itemId);
            return Ok(movements);
        }

        /// <summary>
        /// Retrieves the movement history initiated by a specific operator (user).
        /// </summary>
        /// <param name="userId">The GUID of the user who registered the movements.</param>
        /// <returns>A list of movements associated with the specified user.</returns>
        [HttpGet("by-operator/{userId:guid}")]
        [ProducesResponseType(typeof(IEnumerable<MovementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMovementsByUser(Guid userId)
        {
            var movements = await _movementService.GetMovementsByUserIdAsync(userId);
            return Ok(movements);
        }

        /// <summary>
        /// Retrieves the movement history for a specific recipient (user).
        /// </summary>
        /// <param name="recipientId">The GUID of the user who received items.</param>
        /// <returns>A list of movements where the user was the recipient.</returns>
        [HttpGet("recipient/{recipientId:guid}")]
        [ProducesResponseType(typeof(IEnumerable<MovementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMovementsByRecipient(Guid recipientId)
        {
            var movements = await _movementService.GetMovementsByRecipientIdAsync(recipientId);
            return Ok(movements);
        }

        // TODO: Implement the GetMovementById(guid id) endpoint for CreatedAtAction to function correctly.
        // This endpoint would be useful for fetching the details of a specific movement.
        /// <summary>
        /// Retrieves a specific movement by its unique identifier.
        /// </summary>
        /// <param name="id">The GUID of the movement.</param>
        /// <returns>The details of the specified movement.</returns>
        [HttpGet("{id:guid}", Name = "GetMovementById")]
        [ProducesResponseType(typeof(MovementDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMovementById(Guid id)
        {
            var movement = await _movementService.GetMovementByIdAsync(id);
            if (movement == null)
            {
                return NotFound();
            }
            return Ok(movement);
        }

        /// <summary>
        /// Retrieves a paginated list of system movements, with support for searching and sorting.
        /// </summary>
        /// <param name="queryParams">Parameters for pagination, searching, and sorting.</param>
        /// <remarks>
        /// Access is restricted to users with the 'Almoxarife' or 'RH' role.
        /// Example usage: GET /api/movements?pageNumber=1&pageSize=10&searchTerm=helmet
        /// </remarks>
        /// <returns>A paginated result of movement data transfer objects.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<MovementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllMovements([FromQuery] QueryParameters queryParams)
        {
            var pagedResult = await _movementService.GetAllMovementsAsync(queryParams);
            return Ok(pagedResult);
        }
    }
}