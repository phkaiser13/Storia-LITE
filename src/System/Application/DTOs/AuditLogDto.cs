/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 *
 * Original Author: Jules Keeper / AI-Assistant
 *
 * Description:
 *   This file defines the AuditLogDto, a Data Transfer Object for representing
 *   audit log entries. It includes details about the action performed, the user
 *   who performed it, and the entity that was affected.
 *
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

using StorIA.Core.Domain.Enums;

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Represents a single entry in the audit log.
    /// </summary>
    public class AuditLogDto
    {
        /// <summary>
        /// The unique identifier for the audit log entry.
        /// </summary>
        public Guid id { get; set; }

        /// <summary>
        /// The ID of the user who performed the action.
        /// </summary>
        public Guid userId { get; set; }

        /// <summary>
        /// The user who performed the action (nested object).
        /// </summary>
        public UserDto? user { get; set; }

        /// <summary>
        /// The type of action that was performed (e.g., CREATE, UPDATE, DELETE).
        /// </summary>
        public AuditActionType action { get; set; }

        /// <summary>
        /// The type of entity that was affected (e.g., "Item", "User").
        /// </summary>
        public string entity { get; set; }

        /// <summary>
        /// The ID of the entity that was affected.
        /// </summary>
        public Guid entityId { get; set; }

        /// <summary>
        /// The timestamp of when the action occurred.
        /// </summary>
        public DateTime timestamp { get; set; }

        /// <summary>
        /// A string (preferably JSON) containing details about the change
        /// (e.g., old and new values).
        /// </summary>
        public string details { get; set; }
    }
}
