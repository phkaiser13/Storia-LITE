/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   Defines the enumeration for stock movement types. This is essential for
 *   tracking whether an item is being withdrawn from or returned to the inventory.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Domain.Enums
{
    /// <summary>
    /// Defines the types of stock movements.
    /// Essential for tracking whether an item is being withdrawn or returned.
    /// </summary>
    public enum MovementType
    {
        /// <summary>
        /// Represents the withdrawal of an item from the warehouse by an employee.
        /// This action results in a decrease in the item's stock level.
        /// </summary>
        Saida = 1,

        /// <summary>
        /// Represents the return of an item to the warehouse.
        /// This action results in an increase in the item's stock level.
        /// </summary>
        Devolucao = 2
    }
}