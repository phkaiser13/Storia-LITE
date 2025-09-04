/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 *
 * Original Author: Jules Keeper / AI-Assistant
 *
 * Description:
 *   Defines the types of actions that can be recorded in the audit log.
 *
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Domain.Enums
{
    /// <summary>
    /// Represents the type of action performed for an audit log entry.
    /// </summary>
    public enum AuditActionType
    {
        CREATE,
        UPDATE,
        DELETE,
        LOGIN_SUCCESS,
        LOGIN_FAILURE,
        LOGOUT,
        PASSWORD_CHANGE,
        ACCESS_DENIED,
        VIEW_REPORT,
        EXPORT_DATA,
        IMPORT_DATA
    }
}
