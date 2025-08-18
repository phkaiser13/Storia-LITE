/*
 * Copyright (C) 2025 Storia-LITE, an open-source software by TruveSoftware
 * (a division of Vytruve.org)
 * 
 * Original Author: Pedro Henrique / phkaiser13
 * 
 * Description:
 *   This file defines the PagedResult<T> class, a generic container for returning
 *   paginated data from API endpoints. It encapsulates the data for the current page
 *   along with metadata such as total item count, page size, and current page number,
 *   facilitating the implementation of pagination on the client-side.
 * 
 * More information: https://vytruve.org
 *
 * SPDX-License-Identifier: Apache-2.0
 */

namespace StorIA.Core.Application.DTOs
{
    /// <summary>
    /// Represents the result of a paginated query.
    /// </summary>
    /// <typeparam name="T">The type of the items in the paged list.</typeparam>
    public class PagedResult<T>
    {
        /// <summary>
        /// The list of items for the current page.
        /// </summary>
        public IEnumerable<T> Items { get; set; }

        /// <summary>
        /// The total number of records in the query, disregarding pagination.
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// The current page number.
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// The number of records per page.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// The total number of available pages.
        /// </summary>
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

        /// <summary>
        /// Indicates if there is a previous page.
        /// </summary>
        public bool HasPreviousPage => PageNumber > 1;

        /// <summary>
        /// Indicates if there is a next page.
        /// </summary>
        public bool HasNextPage => PageNumber < TotalPages;

        /// <summary>
        /// Initializes a new instance of the <see cref="PagedResult{T}"/> class.
        /// </summary>
        /// <param name="items">The collection of items for the current page.</param>
        /// <param name="totalCount">The total count of items across all pages.</param>
        /// <param name="pageNumber">The current page number.</param>
        /// <param name="pageSize">The size of the page.</param>
        public PagedResult(IEnumerable<T> items, int totalCount, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}