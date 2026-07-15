import foodModel from "../models/foodModel.js";

/**
 * Search food items with filters, sorting, and pagination.
 * GET /api/search?q=keyword&category=...&restaurant=...&minPrice=...&maxPrice=...
 *   &minRating=...&isVeg=...&isAvailable=...&sort=...&page=...&limit=...
 */
const searchFood = async (req, res) => {
    try {
        const {
            q,
            category,
            restaurant,
            cuisine,
            minPrice,
            maxPrice,
            minRating,
            isVeg,
            isAvailable,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        // Validate and sanitize query
        const query = q ? q.trim().replace(/\s+/g, " ") : "";
        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        if (query.length < 2) {
            return res.status(400).json({ success: false, message: "Search query must be at least 2 characters" });
        }

        // Escape special regex characters for safe partial matching
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Build regex-based OR query across multiple fields
        const searchRegex = new RegExp(escapedQuery, "i");
        const searchCondition = {
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { restaurant: searchRegex },
                { cuisine: searchRegex },
                { tags: { $elemMatch: searchRegex } }
            ]
        };

        // Build filter conditions
        const filterConditions = [searchCondition];

        if (category) {
            filterConditions.push({ category: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
        }
        if (restaurant) {
            filterConditions.push({ restaurant: new RegExp(restaurant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
        }
        if (cuisine) {
            filterConditions.push({ cuisine: new RegExp(cuisine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
        }
        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = Number(minPrice);
            if (maxPrice) priceFilter.$lte = Number(maxPrice);
            filterConditions.push({ price: priceFilter });
        }
        if (minRating) {
            filterConditions.push({ rating: { $gte: Number(minRating) } });
        }
        if (isVeg !== undefined && isVeg !== "") {
            filterConditions.push({ isVeg: isVeg === "true" });
        }
        if (isAvailable !== undefined && isAvailable !== "") {
            filterConditions.push({ isAvailable: isAvailable === "true" });
        }

        const filter = { $and: filterConditions };

        // Build sort object
        let sortOption = { score: { $meta: "textScore" } }; // default relevance
        switch (sort) {
            case "price_low":
                sortOption = { price: 1 };
                break;
            case "price_high":
                sortOption = { price: -1 };
                break;
            case "rating":
                sortOption = { rating: -1 };
                break;
            case "newest":
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { rating: -1, name: 1 };
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const [results, totalCount] = await Promise.all([
            foodModel.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
            foodModel.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: results,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error during search" });
    }
};

/**
 * Get search suggestions based on partial query.
 * GET /api/search/suggestions?q=keyword
 */
const getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        const query = q ? q.trim().replace(/\s+/g, " ") : "";
        if (!query || query.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedQuery, "i");

        // Fetch distinct suggestions from multiple fields
        const [foodNames, categories, restaurants, tags] = await Promise.all([
            foodModel.distinct("name", { name: searchRegex, isAvailable: true }),
            foodModel.distinct("category", { category: searchRegex }),
            foodModel.distinct("restaurant", { restaurant: searchRegex, restaurant: { $ne: "" } }),
            foodModel.distinct("tags", { tags: { $elemMatch: searchRegex } })
        ]);

        // Build suggestions list with type labels
        const suggestions = [];
        const seen = new Set();
        const limit = 8;

        // Prioritize food name matches
        for (const name of foodNames) {
            if (suggestions.length >= limit) break;
            const key = `food:${name}`;
            if (!seen.has(key)) {
                seen.add(key);
                suggestions.push({ text: name, type: "food" });
            }
        }

        // Add category matches
        for (const cat of categories) {
            if (suggestions.length >= limit) break;
            const key = `category:${cat}`;
            if (!seen.has(key)) {
                seen.add(key);
                suggestions.push({ text: cat, type: "category" });
            }
        }

        // Add restaurant matches
        for (const rest of restaurants) {
            if (suggestions.length >= limit) break;
            const key = `restaurant:${rest}`;
            if (!seen.has(key)) {
                seen.add(key);
                suggestions.push({ text: rest, type: "restaurant" });
            }
        }

        // Add tag matches
        for (const tag of tags) {
            if (suggestions.length >= limit) break;
            const key = `tag:${tag}`;
            if (!seen.has(key)) {
                seen.add(key);
                suggestions.push({ text: tag, type: "cuisine" });
            }
        }

        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error fetching suggestions" });
    }
};

export { searchFood, getSearchSuggestions };
