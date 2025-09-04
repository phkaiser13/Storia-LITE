/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 *
 * Original Author: Jules Keeper / AI-Assistant
 *
 * Description:
 *   This file defines the CostByCenterDto, a Data Transfer Object used for
 *   reporting the total cost of items withdrawn, grouped by cost center.
 *
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using System.Collections.Generic;

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Represents the total cost of movements for a specific cost center.
    /// </summary>
    public class CostByCenterDto
    {
        /// <summary>
        /// The name of the cost center.
        /// </summary>
        public string costCenter { get; set; }

        /// <summary>
        /// The total calculated cost for all movements in this group.
        /// </summary>
        public decimal totalCost { get; set; }

        /// <summary>
        /// The list of movements that contribute to this total cost.
        /// </summary>
        public List<MovementDto> movements { get; set; }
    }
}
