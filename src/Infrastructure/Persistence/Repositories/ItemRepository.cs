/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the concrete implementation of the IItemRepository interface
 *   using Entity Framework Core. It handles all data access logic for the Item entity,
 *   including basic CRUD operations, querying, and advanced features like searching,
 *   sorting, and pagination.
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
    /// Concrete implementation of the item repository using Entity Framework Core.
    /// </summary>
    public class ItemRepository : IItemRepository
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="ItemRepository"/> class.
        /// </summary>
        /// <param name="context">The database context to be used for data operations.</param>
        public ItemRepository(AppDbContext context)
        {
            _context = context;
        }

        // --- Existing Methods ---

        /// <inheritdoc />
        public async Task<Item> GetByIdAsync(Guid id) => await _context.Items.FindAsync(id);

        /// <inheritdoc />
        public async Task<Item> GetBySkuAsync(string sku) => await _context.Items.FirstOrDefaultAsync(i => i.Sku.ToUpper() == sku.ToUpper());

        /// <inheritdoc />
        public async Task<IEnumerable<Item>> GetAllAsync() => await _context.Items.AsNoTracking().ToListAsync();

        /// <inheritdoc />
        public async Task<IEnumerable<Item>> GetByExpiryDateRangeAsync(DateTime startDate, DateTime endDate) => await _context.Items.Where(i => i.ExpiryDate.HasValue && i.ExpiryDate >= startDate && i.ExpiryDate <= endDate).AsNoTracking().OrderBy(i => i.ExpiryDate).ToListAsync();

        /// <inheritdoc />
        public async Task AddAsync(Item item) => await _context.Items.AddAsync(item);

        /// <inheritdoc />
        public void Update(Item item) => _context.Items.Update(item);

        /// <inheritdoc />
        public async Task DeleteAsync(Guid id) { var item = await GetByIdAsync(id); if (item != null) _context.Items.Remove(item); }

        /// <inheritdoc />
        public async Task<int> CountAsync() => await _context.Items.CountAsync();

        /// <inheritdoc />
        public async Task<int> CountExpiringInRangeAsync(DateTime startDate, DateTime endDate) => await _context.Items.CountAsync(i => i.ExpiryDate.HasValue && i.ExpiryDate >= startDate && i.ExpiryDate < endDate);


        // --- New method for pagination, searching, and sorting ---

        /// <inheritdoc />
        public async Task<PagedResult<Item>> GetPagedAsync(QueryParameters queryParams)
        {
            // 1. Start with a base IQueryable to build the query dynamically.
            var query = _context.Items.AsNoTracking();

            // 2. Apply the search filter if a search term is provided.
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var searchTerm = queryParams.SearchTerm.Trim().ToLower();
                query = query.Where(i =>
                    i.Name.ToLower().Contains(searchTerm) ||
                    i.Sku.ToLower().Contains(searchTerm) ||
                    (i.Description != null && i.Description.ToLower().Contains(searchTerm))
                );
            }

            // 3. Apply dynamic sorting.
            // A dictionary maps API sort column names to entity property expressions.
            var sortColumns = new Dictionary<string, Expression<Func<Item, object>>>
            {
                ["name"] = i => i.Name,
                ["sku"] = i => i.Sku,
                ["stockquantity"] = i => i.StockQuantity,
                ["createdat"] = i => i.CreatedAt
            };

            var sortColumn = queryParams.SortBy?.ToLower() ?? "name";
            if (sortColumns.TryGetValue(sortColumn, out var orderByExpression))
            {
                query = queryParams.SortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(orderByExpression)
                    : query.OrderBy(orderByExpression);
            }
            else
            {
                // Default sorting if the provided field is invalid.
                query = query.OrderBy(i => i.Name);
            }

            // 4. Count the total number of records *after* applying the filter, but *before* pagination.
            var totalCount = await query.CountAsync();

            // 5. Apply pagination.
            var pagedQuery = query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize);

            // 6. Execute the query to get the items for the current page.
            var items = await pagedQuery.ToListAsync();

            // 7. Return the paged result.
            return new PagedResult<Item>(items, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }
    }
}