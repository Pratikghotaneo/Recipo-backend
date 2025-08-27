import { Router } from "express";
import { fetchUnsplashImage, generateRecipePrompt } from "../lib/helper.js";
import geminiModel from "../config/ai-model.js";
import AIRecipe from "../models/ai-recipe.model.js";
import { verifyToken } from "../middleware/verify-middleware.js";
import mongoose from "mongoose";
import { isAuthenticated } from "../middleware/session-middleware.js";

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
aiRecipesRouter.post("/generate-recipes", async (req, res) => {
  const { category, dietType, ingredients, prepTime } = req.body;

  try {
    const prompt = generateRecipePrompt(
      category,
      dietType,
      ingredients,
      prepTime
    );

    const response = await geminiModel.generateContent(prompt);
    let responseText = await response.response.text();

    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (err) {
      console.error("Invalid JSON from AI:", responseText);
      return res.status(400).json({
        message: "Invalid JSON received from AI",
        raw: responseText,
        error: err.message,
      });
    }

    if (!result.recipes || !Array.isArray(result.recipes)) {
      return res.status(400).json({
        message: "AI did not return a valid recipes array",
        raw: result,
      });
    }

    for (let recipe of result.recipes) {
      try {
        let imageUrl = await fetchUnsplashImage(recipe.title);

        if (!imageUrl && recipe.imageDescription) {
          imageUrl = await fetchUnsplashImage(recipe.imageDescription);
        }

        recipe.imageUrl =
          imageUrl || "https://via.placeholder.com/512?text=No+Image+Available";
      } catch (imgErr) {
        console.error("Error fetching Unsplash image:", imgErr.message);
        recipe.imageUrl =
          "https://via.placeholder.com/512?text=Image+Unavailable";
      }
    }

    res.status(200).json({
      message: "success",
      recipes: result.recipes,
    });
  } catch (error) {
    console.error("Recipe generation error:", error.message);
    res.status(500).json({
      message: "Error generating recipe",
      error: error.message,
    });
  }
});

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
aiRecipesRouter.post("/save-recipe", verifyToken, async (req, res, next) => {
  try {
    const { recipe } = req.body;
    const userId = req.user._id;

    if (!recipe || !userId) {
      return res.status(400).json({ message: "Recipe and User ID required" });
    }

    let exitRecipe = await AIRecipe.findOne({ title: recipe.title });

    if (!exitRecipe) {
      exitRecipe = await AIRecipe.create({
        name: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image: recipe.imageUrl,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        diet: recipe.diet,
        userId: [userId],
      });
    } else {
      if (!exitRecipe.userId.includes(userId)) {
        exitRecipe.userId.push(userId);
        await exitRecipe.save();
      }
    }
    res
      .status(200)
      .json({ message: "Recipe store successfully", recipe: exitRecipe });
  } catch (error) {
    next(error);
  }
});

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
aiRecipesRouter.get(
  "/ai-recipes",
  isAuthenticated,
  verifyToken,
  async (req, res, next) => {
    try {
      const userId = req.user._id;
      const aiRecipes = await AIRecipe.find({ userId });
      if (!aiRecipes || aiRecipes.length === 0) {
        return res
          .status(404)
          .json({ message: "No AI generated recipes found", data: [] });
      }
      res.status(200).json({
        message: "AI generated recipes fetched successfully",
        data: aiRecipes,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default aiRecipesRouter;
