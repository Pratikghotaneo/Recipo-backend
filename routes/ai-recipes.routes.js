import { Router } from "express";
import { fetchUnsplashImage, generateRecipePrompt } from "../lib/helper.js";
import geminiModel from "../config/ai-model.js";
import AIRecipe from "../models/ai-recipe.model.js";
import { verifyToken } from "../middleware/verify-middleware.js";
import mongoose from "mongoose";
import { isAuthenticated } from "../middleware/session-middleware.js";
import {
  deleteAIRecipe,
  generateRecipe,
  getAIRecipes,
  saveAIRecipe,
} from "../controllers/ai-recipe.controller.js";

const aiRecipesRouter = Router();

/**
 * @swagger
 * tags:
 *   name: AI Recipe API
 *   description: API endpoints for managing recipes
 */

aiRecipesRouter.get("/", (req, res) => {
  res.send("AI Recipes Endpoint");
});

/**
 * @swagger
 * /ai/generate-recipes:
 *  post:
 *    tags: [AI Recipe API]
 *    summary: Generate a recipe using AI
 *    description: Generate a recipe based on category, diet type, ingredients, and prep time
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         category:
 *          type: string
 *          description: Category of the meal (breakfast, lunch, snacks, dinner)
 *         dietType:
 *          type: string
 *          description: Type of diet (vegetarian, vegan, keto, gluten-free, etc.)
 *         ingredients:
 *          type: array
 *          items:
 *              type: string
 *              description: List of ingredients to include
 *         prepTime:
 *          type: number
 *          description: Preferred preparation time in minutes
 *        required:
 *          - category
 *    responses:
 *      200:
 *          description: Recipe generated successfully
 *      500:
 *          description: Internal server error
 *
 *
 */
aiRecipesRouter.post("/generate-recipes", generateRecipe);

/**
 * @swagger
 * /ai/save-recipe:
 *  post:
 *    tags: [AI Recipe API]
 *    summary: Save a generated recipe
 *    description: Save a generated recipe to the database
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         recipe:
 *          type: object
 *          description: The recipe object to save
 *        required:
 *          - recipe
 *    responses:
 *      200:
 *          description: Recipe saved successfully
 *      400:
 *          description: Bad request
 *      401:
 *          description: Unauthorized
 *      500:
 *          description: Internal server error
 *
 */
aiRecipesRouter.post("/save-recipe", verifyToken, saveAIRecipe);

/** * @swagger
 * /ai/ai-recipes:
 *  get:
 *    tags: [AI Recipe API]
 *    summary: Get all AI generated recipes for the authenticated user
 *    description: Retrieve all AI generated recipes associated with the authenticated user
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *          description: Recipes fetched successfully
 *      401:
 *          description: Unauthorized
 *      500:
 *          description: Internal server error
 *
 */
aiRecipesRouter.get("/ai-recipes", isAuthenticated, verifyToken, getAIRecipes);

/**
 * @swagger
 *  /ai/ai-recipes/{id}:
 *  delete:
 *   tags: [AI Recipe API]
 *   summary: Delete an AI generated recipe by ID
 *   description: Delete an AI generated recipe using its ID
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *        required: true
 *        description: The recipe ID
 *   responses:
 *    200:
 *     description: Recipe deleted successfully
 *    401:
 *     description: Unauthorized
 *    404:
 *     description: Recipe not found
 *    500:
 *     description: Internal server error
 */
aiRecipesRouter.delete("/ai-recipes/:id", verifyToken, deleteAIRecipe);

export default aiRecipesRouter;
