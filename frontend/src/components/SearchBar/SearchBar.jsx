import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const API_URL = "http://localhost:4000";

/**
 * SearchBar component with debounced live suggestions,
 * keyboard navigation, and loading/error states.
 */
const SearchBar = ({ onSearch, compact = false }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("recentSearches") || "[]");
        } catch {
            return [];
        }
    });

    const navigate = useNavigate();
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
            setRecentSearches(stored);
        } catch {
            setRecentSearches([]);
        }
    }, []);

    // Save a search term to recent searches
    const saveRecentSearch = useCallback((term) => {
        if (!term.trim()) return;
        setRecentSearches((prev) => {
            const updated = [term.trim(), ...prev.filter((s) => s !== term.trim())].slice(0, 5);
            localStorage.setItem("recentSearches", JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Fetch suggestions with debounce and abort controller
    const fetchSuggestions = useCallback((searchTerm) => {
        // Cancel any in-flight request
        if (abortRef.current) {
            abortRef.current.abort();
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const trimmed = searchTerm.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;
            try {
                const res = await fetch(
                    `${API_URL}/api/search/suggestions?q=${encodeURIComponent(trimmed)}`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                if (data.success) {
                    setSuggestions(data.data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setSuggestions([]);
                }
            } finally {
                setLoading(false);
            }
        }, 350);
    }, []);

    // Handle input change
    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setActiveIndex(-1);
        fetchSuggestions(value);
    };

    // Navigate to search results page
    const goToSearch = useCallback(
        (searchTerm) => {
            const trimmed = searchTerm.trim();
            if (!trimmed || trimmed.length < 2) return;
            saveRecentSearch(trimmed);
            setShowSuggestions(false);
            setSuggestions([]);
            if (onSearch) {
                onSearch(trimmed);
            } else {
                navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            }
        },
        [navigate, onSearch, saveRecentSearch]
    );

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
            goToSearch(suggestions[activeIndex].text);
        } else {
            goToSearch(query);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case "Enter":
                // handled in handleSubmit
                break;
            case "Escape":
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;
            default:
                break;
        }
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cleanup debounce and abort on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    // Clear search
    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
        if (inputRef.current) inputRef.current.focus();
    };

    // Get display label for suggestion type
    const typeLabel = (type) => {
        switch (type) {
            case "food":
                return "🍽";
            case "category":
                return "📂";
            case "restaurant":
                return "🏪";
            case "cuisine":
                return "🏷";
            default:
                return "🔍";
        }
    };

    const showDropdown = showSuggestions && (suggestions.length > 0 || (query.trim().length >= 2 && recentSearches.length > 0));

    return (
        <div className={`search-bar-wrapper ${compact ? "search-bar-compact" : ""}`}>
            <form className="search-bar-form" onSubmit={handleSubmit}>
                <div className="search-bar-input-wrapper">
                    <svg
                        className="search-bar-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-bar-input"
                        placeholder="Search food, restaurants, cuisine..."
                        value={query}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (suggestions.length > 0 || (query.trim().length >= 2 && recentSearches.length > 0)) {
                                setShowSuggestions(true);
                            }
                        }}
                        autoComplete="off"
                        aria-label="Search food"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                    />
                    {loading && <div className="search-bar-spinner" />}
                    {query && !loading && (
                        <button
                            type="button"
                            className="search-bar-clear"
                            onClick={handleClear}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                <button type="submit" className="search-bar-submit">
                    Search
                </button>
            </form>

            {/* Suggestions dropdown */}
            {showDropdown && (
                <div className="search-bar-dropdown" ref={suggestionsRef}>
                    {suggestions.length > 0 && (
                        <div className="search-bar-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.text}`}
                                    className={`search-bar-suggestion ${
                                        index === activeIndex ? "active" : ""
                                    }`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        goToSearch(suggestion.text);
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <span className="suggestion-icon">
                                        {typeLabel(suggestion.type)}
                                    </span>
                                    <span className="suggestion-text">
                                        {suggestion.text}
                                    </span>
                                    <span className="suggestion-type">
                                        {suggestion.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent searches when no suggestions match */}
                    {suggestions.length === 0 && query.trim().length >= 2 && recentSearches.length > 0 && (
                        <div className="search-bar-recent">
                            <div className="search-bar-recent-header">
                                <span>Recent searches</span>
                                <button
                                    className="search-bar-recent-clear"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        localStorage.removeItem("recentSearches");
                                        setRecentSearches([]);
                                    }}
                                >
                                    Clear all
                                </button>
                            </div>
                            {recentSearches.slice(0, 5).map((term) => (
                                <button
                                    key={term}
                                    className="search-bar-suggestion"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setQuery(term);
                                        goToSearch(term);
                                    }}
                                >
                                    <span className="suggestion-icon">🕐</span>
                                    <span className="suggestion-text">{term}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
