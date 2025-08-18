/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file contains the implementation for generating JSON Web Tokens (JWT).
 *   This class is responsible for creating a secure token, populating it with
 *   user information (claims), and signing it with a secret key retrieved from
 *   the application's configuration.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StorIA.Core.Domain.Entities;
using StorIA.Core.Application.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StorIA.Infrastructure.Security
{
    /// <summary>
    /// Implements the JSON Web Token (JWT) generator.
    /// This class is responsible for creating a secure token, populating it with user
    /// information (claims), and signing it with a secret key.
    /// </summary>
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Initializes a new instance of the <see cref="JwtTokenGenerator"/> class.
        /// </summary>
        /// <param name="configuration">The application configuration, used to retrieve JWT settings.</param>
        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Generates a JWT based on the user's information.
        /// Returns a tuple containing the token string and its expiration date.
        /// </summary>
        /// <param name="user">The user for whom the token will be generated.</param>
        /// <returns>A tuple containing the generated token string and its UTC expiration date.</returns>
        public (string Token, DateTime ExpiryDate) GenerateToken(User user)
        {
            // 1. Define the user's claims.
            // Claims are statements about the user that will be embedded in the token.
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // "Subject" - The user's unique identifier.
                new Claim(JwtRegisteredClaimNames.Email, user.Email),       // User's email address.
                new Claim(JwtRegisteredClaimNames.Name, user.FullName),     // User's full name.
                new Claim(ClaimTypes.Role, user.Role.ToString())            // User's role.
            };

            // 2. Retrieve the secret key from the configuration file.
            var secretKey = _configuration["JwtSettings:Secret"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            // 3. Create the signing credentials.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 4. Set the token's expiration date.
            var expiryInMinutes = double.Parse(_configuration["JwtSettings:ExpiryInMinutes"]);
            var expiryDate = DateTime.UtcNow.AddMinutes(expiryInMinutes);

            // 5. Create the JWT.
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: expiryDate,
                signingCredentials: creds
            );

            // 6. Serialize the token into a string format.
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenString = tokenHandler.WriteToken(token);

            // 7. Return the tuple with the token string and its expiration date.
            return (tokenString, expiryDate);
        }
    }
}