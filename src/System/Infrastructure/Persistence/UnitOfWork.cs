/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file provides the concrete implementation of the Unit of Work pattern.
 *   It is responsible for managing the database context lifecycle and providing
 *   access to all repositories, ensuring that all database operations within a
 *   single business transaction are handled atomically.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Application.Interfaces;
using StorIA.Infrastructure.Persistence.Repositories;

namespace StorIA.Infrastructure.Persistence
{
    /// <summary>
    /// Represents the concrete implementation of the Unit of Work pattern.
    /// It manages the DbContext lifecycle and provides access to repositories,
    /// ensuring that all operations within a single business transaction are committed together.
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        // Repositories are lazily instantiated for optimization purposes.
        // They are only created when they are actually requested.
        private ItemRepository _itemRepository;
        private UserRepository _userRepository;
        private MovementRepository _movementRepository;
        private RefreshTokenRepository _refreshTokenRepository;

        public IItemRepository Items => _itemRepository ??= new ItemRepository(_context);
        public IUserRepository Users => _userRepository ??= new UserRepository(_context);
        public IMovementRepository Movements => _movementRepository ??= new MovementRepository(_context);
        public IRefreshTokenRepository RefreshTokens => _refreshTokenRepository ??= new RefreshTokenRepository(_context);

        /// <summary>
        /// Initializes a new instance of the <see cref="UnitOfWork"/> class.
        /// </summary>
        /// <param name="context">The database context to be used by the unit of work, injected via dependency injection.</param>
        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Asynchronously saves all pending changes to the database as a single transaction.
        /// </summary>
        /// <returns>
        /// A task that represents the asynchronous save operation. The task result contains 
        /// the number of state entries written to the database.
        /// </returns>
        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Releases the resources managed by the DbContext.
        /// </summary>
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}