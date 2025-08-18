/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This class defines the AutoMapper profiles for the application. It centralizes
 *   all object-to-object mapping configurations, primarily for converting domain
 *   entities to Data Transfer Objects (DTOs) and vice versa. This approach promotes
 *   a clean architecture by decoupling domain models from the models used for
 *   data transfer in APIs or views.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using AutoMapper;
using StorIA.Core.Application.DTOs;
using StorIA.Core.Domain.Entities;

namespace StorIA.Core.Application.Mappings
{
    /// <summary>
    /// Configures the mappings between domain entities and Data Transfer Objects (DTOs)
    /// using AutoMapper. This centralizes all object conversion logic.
    /// </summary>
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // --- User Mappings ---
            CreateMap<User, UserDto>();
            CreateMap<UpdateProfileRequestDto, User>();

            // --- Item Mappings ---
            CreateMap<Item, ItemDto>();
            CreateMap<CreateItemRequestDto, Item>();
            CreateMap<UpdateItemRequestDto, Item>();

            // --- Movement Mappings ---
            CreateMap<Movement, MovementDto>()
                // Configure explicit mappings for properties that do not directly correspond by name.
                // This is often necessary when flattening complex domain models into simpler DTOs.
                .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item.Name))
                .ForMember(dest => dest.ItemSku, opt => opt.MapFrom(src => src.Item.Sku))
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName));
        }
    }
}