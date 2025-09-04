/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   Defines the user roles and access levels within the application. This
 *   enumeration ensures type safety and consistency when handling user
 *   permissions and authorization across the system.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Domain.Enums
{
    /// <summary>
    /// Defines the roles (access levels) a user can have within the system.
    /// Using an enum ensures consistency and type safety throughout the application.
    /// </summary>
    public enum UserRole
    {
        /// <summary>
        /// The Warehouse Manager is responsible for the daily management of the stock.
        /// This role can register item check-ins and check-outs.
        /// </summary>
        Almoxarife = 1,

        /// <summary>
        /// The HR (Human Resources) role has a management and auditing perspective.
        /// This role can manage users and generate strategic reports.
        /// </summary>
        RH = 2,

        /// <summary>
        /// The Employee is the end-user who withdraws and returns items.
        /// Typically, this role will not have login access to the system, but their
        /// record is essential for tracking movements.
        /// </summary>
        Colaborador = 3,

        /// <summary>
        /// The Administrator has full access to the system.
        /// A superuser role intended for maintenance and initial configuration.
        /// </summary>
        Admin = 99
    }
}