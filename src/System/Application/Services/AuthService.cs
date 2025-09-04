/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This service class implements the IAuthService interface and is responsible for
 *   handling all authentication-related logic. It manages user login by verifying
 *   credentials, generating JSON Web Tokens (JWTs), and creating refresh tokens.
 *   It also handles the token refresh mechanism to maintain user sessions.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.Extensions.Configuration;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Application.Interfaces;
using StorIA.Core.Domain.Entities;
using System.Security.Cryptography;

namespace StorIA.Core.Application.Services
{
    /// <summary>
    /// Provides services for user authentication, including login and token refreshing.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthService"/> class.
        /// </summary>
        /// <param name="unitOfWork">The unit of work for database operations.</param>
        /// <param name="passwordHasher">The service for hashing and verifying passwords.</param>
        /// <param name="jwtTokenGenerator">The service for generating JWTs.</param>
        /// <param name="configuration">The application configuration for accessing settings.</param>
        public AuthService(
            IUnitOfWork unitOfWork,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator,
            IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _configuration = configuration;
        }

        /// <summary>
        /// Authenticates a user by email and password.
        /// </summary>
        /// <param name="email">The user's email address.</param>
        /// <param name="password">The user's password.</param>
        /// <returns>
        /// An <see cref="AuthResultDto"/> containing the JWT, refresh token, and user details upon successful authentication;
        /// otherwise, returns null.
        /// </returns>
        public async Task<AuthResultDto> LoginAsync(string email, string password)
        {
            // Retrieve the user by email from the repository.
            var user = await _unitOfWork.Users.GetByEmailAsync(email);

            // Return null if the user does not exist or is inactive.
            if (user == null || !user.IsActive) return null;

            // Verify the provided password against the stored hash.
            if (!_passwordHasher.VerifyPassword(user.PasswordHash, password)) return null;

            // Step 1: Generate the JSON Web Token (JWT).
            var (jwt, expiryDate) = _jwtTokenGenerator.GenerateToken(user);

            // Step 2: Generate a new refresh token.
            var refreshToken = GenerateRefreshToken(user.Id);
            await _unitOfWork.RefreshTokens.AddAsync(refreshToken);

            // Persist changes to the database.
            await _unitOfWork.CompleteAsync();

            // Step 3: Construct the response DTO with authentication details.
            return new AuthResultDto
            {
                Token = jwt,
                ExpiryDate = expiryDate,
                RefreshToken = refreshToken.Token,
                UserId = user.Id,
                FullName = user.FullName,
                Role = user.Role.ToString()
            };
        }

        /// <summary>
        /// Refreshes an authentication session using a valid refresh token.
        /// </summary>
        /// <param name="token">The refresh token to be validated.</param>
        /// <returns>
        /// A new <see cref="AuthResultDto"/> with a new JWT and refresh token if the provided token is valid;
        /// otherwise, returns null.
        /// </returns>
        public async Task<AuthResultDto> RefreshTokenAsync(string token)
        {
            // Retrieve the stored refresh token from the database.
            var storedToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(token);

            // Return null if the token is not found or is no longer active (e.g., expired or revoked).
            if (storedToken == null || !storedToken.IsActive) return null;

            // Revoke the used refresh token to prevent reuse.
            storedToken.Revoke();

            // Step 1: Generate a new JWT for the user.
            var (newJwt, newExpiryDate) = _jwtTokenGenerator.GenerateToken(storedToken.User);

            // Step 2: Generate a new refresh token to replace the old one.
            var newRefreshToken = GenerateRefreshToken(storedToken.UserId);
            await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken);

            // Persist changes, including the revocation of the old token and the addition of the new one.
            await _unitOfWork.CompleteAsync();

            // Step 3: Construct the response DTO with the new authentication details.
            return new AuthResultDto
            {
                Token = newJwt,
                ExpiryDate = newExpiryDate,
                RefreshToken = newRefreshToken.Token,
                UserId = storedToken.User.Id,
                FullName = storedToken.User.FullName,
                Role = storedToken.User.Role.ToString()
            };
        }

        /// <summary>
        /// Generates a cryptographically secure refresh token.
        /// </summary>
        /// <param name="userId">The ID of the user for whom the token is generated.</param>
        /// <returns>A new <see cref="RefreshToken"/> entity.</returns>
        private RefreshToken GenerateRefreshToken(Guid userId)
        {
            // Create a byte array to hold random data.
            var randomNumber = new byte[64];

            // Use a cryptographic random number generator for security.
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            // Convert the random bytes to a Base64 string to create the token.
            var tokenString = Convert.ToBase64String(randomNumber);

            // Read the token's lifespan from configuration settings.
            var expiryInDays = double.Parse(_configuration["JwtSettings:RefreshTokenExpiryInDays"]);
            var expiryDate = DateTime.UtcNow.AddDays(expiryInDays);

            return new RefreshToken(tokenString, userId, expiryDate);
        }

        /// <summary>
        /// Changes the password for a specified user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="currentPassword">The user's current password for verification.</param>
        /// <param name="newPassword">The new password to be set.</param>
        /// <returns>
        /// True if the password was successfully updated; otherwise, false.
        /// </returns>
        public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            // Retrieve the user from the database.
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                // User not found, cannot change password.
                return false;
            }

            // Verify that the current password is correct.
            if (!_passwordHasher.VerifyPassword(user.PasswordHash, currentPassword))
            {
                // Incorrect current password.
                return false;
            }

            // Hash the new password and update the user entity.
            user.PasswordHash = _passwordHasher.HashPassword(newPassword);
            _unitOfWork.Users.Update(user);

            // Persist the changes to the database.
            await _unitOfWork.CompleteAsync();

            return true;
        }
    }
}