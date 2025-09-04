/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file implements the IUserService interface, providing the core business logic
 *   for user management. It handles operations such as user registration, profile updates,
 *   password changes, and fetching user data with pagination. It coordinates the
 *   repository (via IUnitOfWork), password hashing (IPasswordHasher), and data
 *   mapping (IMapper) to fulfill these responsibilities.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using AutoMapper;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Domain.Entities;
using StorIA.Core.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Implements the user management service.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserService"/> class.
        /// </summary>
        /// <param name="unitOfWork">The unit of work for database operations.</param>
        /// <param name="passwordHasher">The service for hashing and verifying passwords.</param>
        /// <param name="mapper">The AutoMapper instance for object mapping.</param>
        public UserService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _mapper = mapper;
        }

        /// <inheritdoc />
        public async Task<UserDto> RegisterUserAsync(RegisterUserRequestDto request)
        {
            // 1. Check if the email is already in use.
            var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                // Throws a ValidationException that can be handled by middleware to return a 409 Conflict error.
                throw new ValidationException("A user with this email already exists.");
            }

            // 2. Convert the role string to the UserRole enum.
            // FluentValidation has already ensured that the value is valid.
            Enum.TryParse<UserRole>(request.Role, true, out var userRole);

            // 3. Create the new User domain entity.
            var newUser = new User(request.FullName, request.Email, userRole);

            // 4. Hash the password and assign it to the user.
            var passwordHash = _passwordHasher.HashPassword(request.Password);
            newUser.SetPassword(passwordHash);

            // 5. Add the new user to the repository and save the changes.
            await _unitOfWork.Users.AddAsync(newUser);
            await _unitOfWork.CompleteAsync(); // Commit the transaction

            // 6. Map the User entity to a UserDto and return it.
            // This prevents exposing the domain entity and the password hash.
            return _mapper.Map<UserDto>(newUser);
        }

        /// <inheritdoc />
        public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
        {
            // 1. Fetch the user by their ID.
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                // In a "update my profile" scenario, the user should always exist.
                // Throwing an exception here is appropriate for an unexpected state.
                throw new KeyNotFoundException("User not found.");
            }

            // 2. Check if the new email is already in use by ANOTHER user.
            if (!user.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existingUserWithEmail = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (existingUserWithEmail != null && existingUserWithEmail.Id != userId)
                {
                    throw new ValidationException("The new email is already in use by another account.");
                }
            }

            // 3. Map the data from the DTO to the existing entity.
            // AutoMapper will handle this, assuming the mapping configuration exists.
            _mapper.Map(request, user);

            // 4. EF Core is already tracking the 'user' entity, so the changes will be saved on CompleteAsync.
            await _unitOfWork.CompleteAsync();

            // 5. Return the updated user DTO.
            return _mapper.Map<UserDto>(user);
        }

        /// <inheritdoc />
        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request)
        {
            // 1. Fetch the user by their ID.
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                // This should not happen in a normal flow, but it's a security check.
                return false;
            }

            // 2. Verify if the provided current password is correct.
            if (!_passwordHasher.VerifyPassword(user.PasswordHash, request.CurrentPassword))
            {
                // The current password is incorrect. Return false to indicate failure.
                return false;
            }

            // 3. Hash the new password.
            var newPasswordHash = _passwordHasher.HashPassword(request.NewPassword);

            // 4. Update the user's password in the domain entity.
            user.SetPassword(newPasswordHash);

            // 5. Save the changes to the database.
            await _unitOfWork.CompleteAsync();

            return true;
        }

        /// <inheritdoc />
        public async Task<PagedResult<UserDto>> GetAllUsersAsync(QueryParameters queryParams)
        {
            // 1. Call the repository method to get the paged result of the entity.
            var pagedUsers = await _unitOfWork.Users.GetPagedAsync(queryParams);

            // 2. Map the list of entities (User) to a list of DTOs (UserDto).
            var usersDto = _mapper.Map<IEnumerable<UserDto>>(pagedUsers.Items);

            // 3. Create a new PagedResult, but of type UserDto,
            //    forwarding the pagination metadata from the original result.
            return new PagedResult<UserDto>(
                usersDto,
                pagedUsers.TotalCount,
                pagedUsers.PageNumber,
                pagedUsers.PageSize
            );
        }
    }
}