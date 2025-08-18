/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the QueryParameters class, a reusable object for encapsulating
 *   common query options such as pagination, searching, and sorting. It is used
 *   in API endpoints to provide a standardized way for clients to request
 *   filtered and ordered data collections.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Encapsulates query parameters for searching, sorting, and pagination.
    /// </summary>
    public class QueryParameters
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 20;

        /// <summary>
        /// The page number to be returned. Defaults to 1.
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// The number of records per page. Defaults to 20, with a maximum of 100.
        /// </summary>
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }

        /// <summary>
        /// The search term to be applied to the query.
        /// </summary>
        public string? SearchTerm { get; set; }

        /// <summary>
        /// The name of the field by which the results should be sorted.
        /// </summary>
        public string? SortBy { get; set; }

        /// <summary>
        /// The sort order ("asc" for ascending, "desc" for descending).
        /// </summary>
        public string? SortOrder { get; set; } = "asc";
    }
}