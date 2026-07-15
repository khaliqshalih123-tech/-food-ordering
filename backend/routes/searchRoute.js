import express from "express";
import { searchFood, getSearchSuggestions } from "../controllers/searchController.js";

const searchRouter = express.Router();

// GET /api/search/suggestions?q=keyword — must be defined before /:q to avoid route conflict
searchRouter.get("/suggestions", getSearchSuggestions);

// GET /api/search?q=keyword&category=...&sort=...&page=...
searchRouter.get("/", searchFood);

export default searchRouter;
