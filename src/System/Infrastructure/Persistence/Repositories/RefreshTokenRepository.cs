/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the concrete implementation of the Refresh Token repository.
 *   It handles data access operations for RefreshToken entities, such as retrieving
 *   a token from the database and adding a new one. This class uses Entity Framework Core
 *   for database interactions.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.EntityFrameworkCore;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Domain.Entities;

namespace StorIA.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Concrete implementation of the refresh token repository.
    /// </summary>
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="RefreshTokenRepository"/> class.
        /// </summary>
        /// <param name="context">The database context to be used for data operations.</param>
        public RefreshTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Asynchronously retrieves a refresh token by its string value.
        /// </summary>
        /// <param name="token">The refresh token string to search for.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains the 
        /// <see cref="RefreshToken"/> entity if found; otherwise, null.
        /// </returns>
        public async Task<RefreshToken> GetByTokenAsync(string token)
        {
            // The .Include() method is used to load the related User data in the same query (Eager Loading).
            // This is crucial for the AuthService to generate a new JWT without requiring additional database queries.
            return await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        /// <summary>
        /// Asynchronously adds a new refresh token to the database context.
        /// Note: This method only adds the entity to the context. A call to SaveChangesAsync() is required to persist the data.
        /// </summary>
        /// <param name="token">The <see cref="RefreshToken"/> entity to add.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task AddAsync(RefreshToken token)
        {
            await _context.RefreshTokens.AddAsync(token);
        }
    }
}