/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This interface defines the contract for the Unit of Work pattern.
 *   It is responsible for grouping multiple repository operations into a single
 *   transaction, ensuring data consistency and integrity across the application.
 *   It provides access to all repositories and a method to commit the changes atomically.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for the Unit of Work pattern.
    /// It groups multiple repository operations into a single transaction,
    /// ensuring data consistency.
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Gets the repository for Item entities.
        /// </summary>
        IItemRepository Items { get; }

        /// <summary>
        /// Gets the repository for Movement entities.
        /// </summary>
        IMovementRepository Movements { get; }

        /// <summary>
        /// Gets the repository for User entities.
        /// </summary>
        IUserRepository Users { get; }

        /// <summary>
        /// Gets the repository for Refresh Token entities.
        /// </summary>
        IRefreshTokenRepository RefreshTokens { get; }

        /// <summary>
        /// Saves all changes made in this context to the underlying database.
        /// </summary>
        /// <returns>A task that represents the asynchronous save operation. 
        /// The task result contains the number of state entries written to the database.</returns>
        Task<int> CompleteAsync();
    }
}