/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file provides the concrete implementation of the IUserRepository interface
 *   using Entity Framework Core. It is responsible for all data access logic
 *   related to User entities, including standard CRUD operations and more complex
 *   queries for pagination, searching, and sorting.
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
    /// Concrete implementation of the user repository using Entity Framework Core.
    /// </summary>
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserRepository"/> class.
        /// </summary>
        /// <param name="context">The database context for data operations.</param>
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        // --- Standard CRUD and Query Methods ---

        /// <inheritdoc />
        public async Task<User> GetByIdAsync(Guid id) => await _context.Users.FindAsync(id);

        /// <inheritdoc />
        public async Task<User> GetByEmailAsync(string email)
        {
            var normalizedEmail = email.ToLowerInvariant();
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<User>> GetAllAsync() => await _context.Users.AsNoTracking().ToListAsync();

        /// <inheritdoc />
        public async Task AddAsync(User user) => await _context.Users.AddAsync(user);

        /// <inheritdoc />
        public void Update(User user) => _context.Users.Update(user);

        /// <inheritdoc />
        public async Task DeleteAsync(Guid id)
        {
            var userToDelete = await GetByIdAsync(id);
            if (userToDelete != null) _context.Users.Remove(userToDelete);
        }

        /// <inheritdoc />
        public async Task<int> CountActiveAsync() => await _context.Users.CountAsync(u => u.IsActive);


        // --- Advanced Query Method for Pagination, Searching, and Sorting ---

        /// <summary>
        /// Asynchronously retrieves a paginated, filtered, and sorted list of users based on the provided query parameters.
        /// </summary>
        /// <param name="queryParams">An object containing parameters for pagination (page number, page size),
        /// searching (search term), and sorting (sort by, sort order).</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains a <see cref="PagedResult{User}"/>
        /// object with the list of users for the current page and pagination metadata.
        /// </returns>
        public async Task<PagedResult<User>> GetPagedAsync(QueryParameters queryParams)
        {
            // Start with a base query, using AsNoTracking for read-only performance optimization.
            var query = _context.Users.AsNoTracking();

            // Apply the search filter if a search term is provided.
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var searchTerm = queryParams.SearchTerm.Trim().ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm)
                );
            }

            // Define a dictionary to map sortable column names to their corresponding property expressions.
            var sortColumns = new Dictionary<string, Expression<Func<User, object>>>
            {
                ["fullname"] = u => u.FullName,
                ["email"] = u => u.Email,
                ["role"] = u => u.Role,
                ["createdat"] = u => u.CreatedAt
            };

            // Apply dynamic sorting based on the query parameters.
            var sortColumn = queryParams.SortBy?.ToLower() ?? "fullname";
            if (sortColumns.TryGetValue(sortColumn, out var orderByExpression))
            {
                query = queryParams.SortOrder?.ToLower() == "desc"
                    ? query.OrderByDescending(orderByExpression)
                    : query.OrderBy(orderByExpression);
            }
            else
            {
                // Default to sorting by FullName if the specified column is invalid.
                query = query.OrderBy(u => u.FullName);
            }

            // Get the total count of items that match the filter criteria *before* applying pagination.
            var totalCount = await query.CountAsync();

            // Apply pagination to the query.
            var pagedQuery = query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize);

            // Execute the final query to retrieve the users for the current page.
            var users = await pagedQuery.ToListAsync();

            // Return the paged result.
            return new PagedResult<User>(users, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }
    }
}