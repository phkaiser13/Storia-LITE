/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file provides the concrete implementation of the IMovementRepository interface
 *   using Entity Framework Core. It is responsible for all data access operations
 *   related to the Movement entity, which tracks stock changes (entries and exits).
 *   It includes methods for querying, as well as advanced searching, sorting, and pagination.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.EntityFrameworkCore;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Domain.Entities;
using System.Linq.Expressions;

namespace StorIA.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Concrete implementation of the movement repository using Entity Framework Core.
    /// </summary>
    public class MovementRepository : IMovementRepository
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="MovementRepository"/> class.
        /// </summary>
        /// <param name="context">The database context to be used for data operations.</param>
        public MovementRepository(AppDbContext context)
        {
            _context = context;
        }

        // --- Existing Methods ---

        /// <inheritdoc />
        public async Task<Movement> GetByIdAsync(Guid id) => await _context.Movements.Include(m => m.Item).Include(m => m.User).FirstOrDefaultAsync(m => m.Id == id);

        /// <inheritdoc />
        public async Task AddAsync(Movement movement) => await _context.Movements.AddAsync(movement);

        /// <inheritdoc />
        public async Task<IEnumerable<Movement>> GetByItemIdAsync(Guid itemId) => await _context.Movements.Where(m => m.ItemId == itemId).Include(m => m.User).AsNoTracking().OrderByDescending(m => m.MovementDate).ToListAsync();

        /// <inheritdoc />
        public async Task<IEnumerable<Movement>> GetByUserIdAsync(Guid userId) => await _context.Movements.Where(m => m.UserId == userId).Include(m => m.Item).AsNoTracking().OrderByDescending(m => m.MovementDate).ToListAsync();

        /// <inheritdoc />
        public async Task<IEnumerable<Movement>> GetByDateRangeAsync(DateTime startDate, DateTime endDate) => await _context.Movements.Where(m => m.MovementDate >= startDate && m.MovementDate <= endDate).Include(m => m.Item).Include(m => m.User).AsNoTracking().OrderByDescending(m => m.MovementDate).ToListAsync();

        /// <inheritdoc />
        public async Task<int> CountByDateRangeAsync(DateTime startDate, DateTime endDate) => await _context.Movements.CountAsync(m => m.MovementDate >= startDate && m.MovementDate < endDate);


        // --- New method for pagination, searching, and sorting ---

        /// <inheritdoc />
        public async Task<PagedResult<Movement>> GetPagedAsync(QueryParameters queryParams)
        {
            // Start the query, including related data for searching and returning.
            var query = _context.Movements
                .Include(m => m.Item)
                .Include(m => m.User)
                .AsNoTracking();

            // Apply search filter by item name, SKU, or user name.
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var searchTerm = queryParams.SearchTerm.Trim().ToLower();
                query = query.Where(m =>
                    m.Item.Name.ToLower().Contains(searchTerm) ||
                    m.Item.Sku.ToLower().Contains(searchTerm) ||
                    m.User.FullName.ToLower().Contains(searchTerm)
                );
            }

            // Apply dynamic sorting.
            var sortColumns = new Dictionary<string, Expression<Func<Movement, object>>>
            {
                ["itemname"] = m => m.Item.Name,
                ["username"] = m => m.User.FullName,
                ["type"] = m => m.Type,
                ["quantity"] = m => m.Quantity,
                ["movementdate"] = m => m.MovementDate
            };

            var sortColumn = queryParams.SortBy?.ToLower() ?? "movementdate";
            if (sortColumns.TryGetValue(sortColumn, out var orderByExpression))
            {
                query = queryParams.SortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(orderByExpression)
                    : query.OrderBy(orderByExpression);
            }
            else
            {
                // Default sorting is by movement date, from newest to oldest.
                query = query.OrderByDescending(m => m.MovementDate);
            }

            // Count the total records after filtering but before pagination.
            var totalCount = await query.CountAsync();

            // Apply pagination.
            var pagedQuery = query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize);

            // Execute the query to get the current page's movements.
            var movements = await pagedQuery.ToListAsync();

            // Return the paged result.
            return new PagedResult<Movement>(movements, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }
    }
}