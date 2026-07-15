import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./SearchResults.css";

const API_URL = "http://localhost:4000";

const SORT_OPTIONS = [
    { value: "", label: "Relevance" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
];

/**
 * SearchResults page with filters, sorting, pagination,
 * and all UI states (loading, empty, error).
 */
const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || "";
    const category = searchParams.get("category") || "";
    const restaurant = searchParams.get("restaurant") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const minRating = searchParams.get("minRating") || "";
    const isVeg = searchParams.get("isVeg") || "";
    const isAvailable = searchParams.get("isAvailable") || "";

    const [results, setResults] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Local filter state for inputs before applying
    const [filterCategory, setFilterCategory] = useState(category);
    const [filterRestaurant, setFilterRestaurant] = useState(restaurant);
    const [filterMinPrice, setFilterMinPrice] = useState(minPrice);
    const [filterMaxPrice, setFilterMaxPrice] = useState(maxPrice);
    const [filterMinRating, setFilterMinRating] = useState(minRating);
    const [filterIsVeg, setFilterIsVeg] = useState(isVeg);
    const [filterIsAvailable, setFilterIsAvailable] = useState(isAvailable);

    const abortRef = useRef(null);

    // Sync local filter state from URL params
    useEffect(() => {
        setFilterCategory(category);
        setFilterRestaurant(restaurant);
        setFilterMinPrice(minPrice);
        setFilterMaxPrice(maxPrice);
        setFilterMinRating(minRating);
        setFilterIsVeg(isVeg);
        setFilterIsAvailable(isAvailable);
    }, [category, restaurant, minPrice, maxPrice, minRating, isVeg, isAvailable]);

    // Build search URL from params
    const buildUrl = useCallback(() => {
        if (!query) return "";
        const params = new URLSearchParams();
        params.set("q", query);
        if (page > 1) params.set("page", page);
        if (sort) params.set("sort", sort);
        if (category) params.set("category", category);
        if (restaurant) params.set("restaurant", restaurant);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (minRating) params.set("minRating", minRating);
        if (isVeg) params.set("isVeg", isVeg);
        if (isAvailable) params.set("isAvailable", isAvailable);
        return `${API_URL}/api/search?${params.toString()}`;
    }, [query, page, sort, category, restaurant, minPrice, maxPrice, minRating, isVeg, isAvailable]);

    // Fetch search results
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            setPagination({ total: 0, totalPages: 0 });
            return;
        }

        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError("");

        const url = buildUrl();
        if (!url) return;

        fetch(url, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error("Search request failed");
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    setResults(data.data);
                    setPagination(data.pagination);
                } else {
                    setError(data.message || "Search failed");
                }
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError("Failed to fetch results. Please try again.");
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [query, page, sort, category, restaurant, minPrice, maxPrice, minRating, isVeg, isAvailable, buildUrl]);

    // Update URL params
    const updateParams = useCallback(
        (updates) => {
            const params = new URLSearchParams(searchParams);
            Object.entries(updates).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });
            if (updates.category !== undefined || updates.sort !== undefined || Object.keys(updates).some(k => k !== "page")) {
                params.delete("page"); // Reset page on filter change
            }
            setSearchParams(params);
        },
        [searchParams, setSearchParams]
    );

    // Apply filters
    const applyFilters = () => {
        updateParams({
            category: filterCategory,
            restaurant: filterRestaurant,
            minPrice: filterMinPrice,
            maxPrice: filterMaxPrice,
            minRating: filterMinRating,
            isVeg: filterIsVeg,
            isAvailable: filterIsAvailable,
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setFilterCategory("");
        setFilterRestaurant("");
        setFilterMinPrice("");
        setFilterMaxPrice("");
        setFilterMinRating("");
        setFilterIsVeg("");
        setFilterIsAvailable("");
        setSearchParams({ q: query });
    };

    // Handle sort change
    const handleSortChange = (e) => {
        updateParams({ sort: e.target.value });
    };

    // Handle page change
    const goToPage = (newPage) => {
        updateParams({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle search from navbar searchbar
    const handleHeaderSearch = (term) => {
        setSearchParams({ q: term });
    };

    // Check if any filters are active
    const hasActiveFilters = category || restaurant || minPrice || maxPrice || minRating || isVeg || isAvailable;

    return (
        <div className="search-results-page">
            {/* Page header with search bar */}
            <div className="search-results-header">
                <SearchBar onSearch={handleHeaderSearch} />
            </div>

            {query && (
                <div className="search-results-info">
                    <h2>
                        {loading ? (
                            "Searching..."
                        ) : (
                            <>
                                {pagination.total} result{pagination.total !== 1 ? "s" : ""} for{" "}
                                <span className="search-query">"{query}"</span>
                            </>
                        )}
                    </h2>
                    <div className="search-results-controls">
                        <button
                            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="4" y1="12" x2="20" y2="12" />
                                <line x1="4" y1="18" x2="20" y2="18" />
                                <circle cx="8" cy="6" r="2" fill="currentColor" />
                                <circle cx="16" cy="12" r="2" fill="currentColor" />
                                <circle cx="10" cy="18" r="2" fill="currentColor" />
                            </svg>
                            Filters
                            {hasActiveFilters && <span className="filter-badge" />}
                        </button>
                        <div className="sort-wrapper">
                            <label htmlFor="sort-select">Sort by:</label>
                            <select
                                id="sort-select"
                                value={sort}
                                onChange={handleSortChange}
                                className="sort-select"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters panel */}
            {showFilters && (
                <div className="search-filters-panel">
                    <div className="filter-group">
                        <label>Category</label>
                        <input
                            type="text"
                            placeholder="e.g. Salad, Pasta"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Restaurant</label>
                        <input
                            type="text"
                            placeholder="Restaurant name"
                            value={filterRestaurant}
                            onChange={(e) => setFilterRestaurant(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Min Price ($)</label>
                        <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={filterMinPrice}
                            onChange={(e) => setFilterMinPrice(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Max Price ($)</label>
                        <input
                            type="number"
                            placeholder="100"
                            min="0"
                            value={filterMaxPrice}
                            onChange={(e) => setFilterMaxPrice(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Min Rating</label>
                        <select
                            value={filterMinRating}
                            onChange={(e) => setFilterMinRating(e.target.value)}
                        >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filterIsVeg}
                            onChange={(e) => setFilterIsVeg(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="true">Veg</option>
                            <option value="false">Non-Veg</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Availability</label>
                        <select
                            value={filterIsAvailable}
                            onChange={(e) => setFilterIsAvailable(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="true">Available</option>
                            <option value="false">Unavailable</option>
                        </select>
                    </div>
                    <div className="filter-actions">
                        <button className="filter-apply-btn" onClick={applyFilters}>
                            Apply Filters
                        </button>
                        {hasActiveFilters && (
                            <button className="filter-clear-btn" onClick={clearFilters}>
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Active filter tags */}
            {hasActiveFilters && !showFilters && (
                <div className="active-filter-tags">
                    {category && (
                        <span className="filter-tag">
                            Category: {category}
                            <button onClick={() => { setFilterCategory(""); updateParams({ category: "" }); }}>×</button>
                        </span>
                    )}
                    {restaurant && (
                        <span className="filter-tag">
                            Restaurant: {restaurant}
                            <button onClick={() => { setFilterRestaurant(""); updateParams({ restaurant: "" }); }}>×</button>
                        </span>
                    )}
                    {minPrice && (
                        <span className="filter-tag">
                            Min: ${minPrice}
                            <button onClick={() => { setFilterMinPrice(""); updateParams({ minPrice: "" }); }}>×</button>
                        </span>
                    )}
                    {maxPrice && (
                        <span className="filter-tag">
                            Max: ${maxPrice}
                            <button onClick={() => { setFilterMaxPrice(""); updateParams({ maxPrice: "" }); }}>×</button>
                        </span>
                    )}
                    {minRating && (
                        <span className="filter-tag">
                            Rating: {minRating}+
                            <button onClick={() => { setFilterMinRating(""); updateParams({ minRating: "" }); }}>×</button>
                        </span>
                    )}
                    {isVeg && (
                        <span className="filter-tag">
                            {isVeg === "true" ? "Veg" : "Non-Veg"}
                            <button onClick={() => { setFilterIsVeg(""); updateParams({ isVeg: "" }); }}>×</button>
                        </span>
                    )}
                    {isAvailable && (
                        <span className="filter-tag">
                            {isAvailable === "true" ? "Available" : "Unavailable"}
                            <button onClick={() => { setFilterIsAvailable(""); updateParams({ isAvailable: "" }); }}>×</button>
                        </span>
                    )}
                </div>
            )}

            {/* Empty search state */}
            {!query && (
                <div className="search-empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>Search for your favorite food</h3>
                    <p>Use the search bar above to find dishes, restaurants, and cuisines</p>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="search-results-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="search-skeleton-card">
                            <div className="skeleton-image skeleton-pulse" />
                            <div className="skeleton-body">
                                <div className="skeleton-line skeleton-line-short skeleton-pulse" />
                                <div className="skeleton-line skeleton-line-medium skeleton-pulse" />
                                <div className="skeleton-line skeleton-line-long skeleton-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* API Error */}
            {error && !loading && (
                <div className="search-error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            )}

            {/* No results */}
            {!loading && !error && query && results.length === 0 && (
                <div className="search-empty-state">
                    <div className="empty-icon">😕</div>
                    <h3>No results found</h3>
                    <p>Try different keywords or adjust your filters</p>
                </div>
            )}

            {/* Results grid */}
            {!loading && !error && results.length > 0 && (
                <>
                    <div className="search-results-grid">
                        {results.map((item) => (
                            <div key={item._id} className="search-result-card">
                                <div className="result-img-container">
                                    <img
                                        src={
                                            item.image.startsWith("http")
                                                ? item.image
                                                : `${API_URL}/images/${item.image}`
                                        }
                                        alt={item.name}
                                        className="result-image"
                                    />
                                    {item.isVeg !== undefined && (
                                        <span className={`veg-badge ${item.isVeg ? "veg" : "non-veg"}`}>
                                            {item.isVeg ? "Veg" : "Non-Veg"}
                                        </span>
                                    )}
                                    {!item.isAvailable && (
                                        <span className="unavailable-overlay">Unavailable</span>
                                    )}
                                </div>
                                <div className="result-info">
                                    <div className="result-name-row">
                                        <h3 className="result-name">{item.name}</h3>
                                        {item.rating > 0 && (
                                            <span className="result-rating">
                                                ★ {item.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    {item.restaurant && (
                                        <p className="result-restaurant">{item.restaurant}</p>
                                    )}
                                    <div className="result-meta">
                                        <span className="result-category">{item.category}</span>
                                        {item.cuisine && (
                                            <span className="result-cuisine">{item.cuisine}</span>
                                        )}
                                    </div>
                                    <p className="result-description">{item.description}</p>
                                    <div className="result-footer">
                                        <span className="result-price">${item.price}</span>
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="result-tags">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="result-tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="search-pagination">
                            <button
                                className="page-btn"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: pagination.totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                // Show first, last, and neighbors of current page
                                if (
                                    pageNum === 1 ||
                                    pageNum === pagination.totalPages ||
                                    Math.abs(pageNum - page) <= 2
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`page-btn ${pageNum === page ? "active" : ""}`}
                                            onClick={() => goToPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                if (Math.abs(pageNum - page) === 3) {
                                    return <span key={`dots-${pageNum}`} className="page-dots">...</span>;
                                }
                                return null;
                            })}
                            <button
                                className="page-btn"
                                disabled={page >= pagination.totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;
