/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the AppDbContext for the StorIA application. It serves as the
 *   primary bridge between the domain entities and the PostgreSQL database, utilizing
 *   Entity Framework Core for object-relational mapping (ORM). It configures the
 *   database schema, tables, relationships, and constraints.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.EntityFrameworkCore;
using StorIA.Core.Domain.Entities;

namespace StorIA.Infrastructure.Persistence
{
    /// <summary>
    /// The DbContext for the StorIA application. It acts as the bridge between the domain entities
    /// and the PostgreSQL database, using Entity Framework Core.
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Represents the collection of all Items in the database. Mapped to the "items" table.
        /// </summary>
        public DbSet<Item> Items { get; set; }

        /// <summary>
        /// Represents the collection of all Users in the database. Mapped to the "users" table.
        /// </summary>
        public DbSet<User> Users { get; set; }

        /// <summary>
        /// Represents the collection of all Refresh Tokens in the database. Mapped to the "refresh_tokens" table.
        /// </summary>
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        /// <summary>
        /// Represents the collection of all Movements in the database. Mapped to the "movements" table.
        /// </summary>
        public DbSet<Movement> Movements { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="AppDbContext"/> class.
        /// </summary>
        /// <param name="options">The options to be used by a DbContext.</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Configures the data model using the EF Core Fluent API.
        /// This is where table names, keys, indexes, and relationships are defined.
        /// </summary>
        /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Sets a default schema for all tables, as specified in the architecture document.
            modelBuilder.HasDefaultSchema("storia");

            // Configuration for the Item entity
            modelBuilder.Entity<Item>(entity =>
            {
                entity.ToTable("items");
                entity.HasKey(i => i.Id);
                entity.HasIndex(i => i.Sku).IsUnique(); // Ensures that the SKU is unique.

                entity.Property(i => i.Name).IsRequired().HasMaxLength(200);
                entity.Property(i => i.Sku).IsRequired().HasMaxLength(50);
                entity.Property(i => i.Category).IsRequired().HasMaxLength(100);
                entity.Property(i => i.Description).HasMaxLength(1000);
            });

            // Configuration for the User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique(); // Ensures that the email is unique.

                entity.Property(u => u.FullName).IsRequired().HasMaxLength(250);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(250);
                entity.Property(u => u.PasswordHash).IsRequired();

                // Converts the UserRole enum to a string for better readability in the database.
                entity.Property(u => u.Role).IsRequired().HasConversion<string>().HasMaxLength(50);
            });

            // Configuration for the Movement entity
            modelBuilder.Entity<Movement>(entity =>
            {
                entity.ToTable("movements");
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Quantity).IsRequired();
                entity.Property(m => m.MovementDate).IsRequired();

                // Converts the MovementType enum to a string.
                entity.Property(m => m.Type).IsRequired().HasConversion<string>().HasMaxLength(50);

                // Configures the relationship with Item.
                entity.HasOne(m => m.Item)
                      .WithMany() // An item can have many movements.
                      .HasForeignKey(m => m.ItemId)
                      .OnDelete(DeleteBehavior.Restrict); // Prevents the deletion of an item if it has associated movements.

                // Configures the relationship with User.
                entity.HasOne(m => m.User)
                      .WithMany() // A user can have many movements.
                      .HasForeignKey(m => m.UserId)
                      .OnDelete(DeleteBehavior.Restrict); // Prevents the deletion of a user if they have associated movements.
            });

            // Configuration for the RefreshToken entity
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("refresh_tokens");
                entity.HasKey(rt => rt.Token);

                // Configures the relationship with User.
                entity.HasOne(rt => rt.User)
                      .WithMany(u => u.RefreshTokens)
                      .HasForeignKey(rt => rt.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // If a user is deleted, their refresh tokens will also be deleted.
            });
        }
    }
}