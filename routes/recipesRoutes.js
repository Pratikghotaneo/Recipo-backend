import express from "express";
import {
  createRecipe,
  deleteRecipe,
  getALlRecipes,
  getUserRecipes,
  updateRecipe,
} from "../controllers/recipe-controller.js";
import { isAuthenticated } from "../middleware/session-middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recipe Controller
 *   description: API endpoints for managing recipes
 */

/**
 * @swagger
 * /recipes:
 *  get:
 *    tags: [Recipe Controller]
 *    summary: Get all recipes
 *    description: Retrieve a list of all recipes
 *    responses:
 *     200:
 *      description: Recipes fetched successfully
 *     500:
 *      description: Internal server error
 *
 */
router.get("/recipes", getALlRecipes);

/**
 * @swagger
 * /recipes/{userId}:
 *  get:
 *    tags: [Recipe Controller]
 *    summary: Get user specific recipes
 *    description: Retrieve a list of all recipes for a specific user
 *    parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       schema:
 *        type: string
 *
 *    responses:
 *     200:
 *      description: Recipes fetched successfully
 *     500:
 *      description: Internal server error
 *
 */
router.get("/recipes/:userId", getUserRecipes);
/**
 * @swagger
 * /recipes:
 *  post:
 *    tags: [Recipe Controller]
 *    summary: Create a new recipe
 *    description: Create a new recipe with the provided details
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              ingredients:
 *                type: array
 *                items:
 *                  type: string
 *              instructions:
 *                type: array
 *                items:
 *                  type: string
 *              image:
 *                type: string
 *              videoUri:
 *                type: string
 *              userId:
 *               type: string
 *            required:
 *              - name
 *              - ingredients
 *              - instructions
 *              - userId
 *    responses:
 *      201:
 *        description: Recipe created successfully
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
router.post("/recipes", isAuthenticated, createRecipe);

/** * @swagger
 * /recipes/{id}:
 *  put:
 *   tags: [Recipe Controller]
 *   summary: Update an existing recipe
 *   description: Update the details of an existing recipe by its ID
 *   parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *   requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            ingredients:
 *              type: array
 *              items:
 *               type: string
 *            instructions:
 *              type: array
 *              items:
 *               type: string
 *            image:
 *              type: string
 *            videoUri:
 *              type: string
 *   responses:
 *      200:
 *        description: Recipe updated successfully
 *      400:
 *        description: Bad request
 *      404:
 *        description: Recipe not found
 *      500:
 *        description: Internal server error
 */
router.put("/recipes/:id", isAuthenticated, updateRecipe);

/** * @swagger
 * /recipes/{id}:
 *  delete:
 *   tags: [Recipe Controller]
 *   summary: Delete a recipe
 *   description: Delete an existing recipe by its ID
 *   parameters:
 *    - in: path
 *      name: id
 *      required: true
 *      schema:
 *        type: string
 *   responses:
 *      200:
 *        description: Recipe deleted successfully
 *      400:
 *        description: Bad request
 *      404:
 *        description: Recipe not found
 *      500:
 *        description: Internal server error
 */
router.delete("/recipes/:id", deleteRecipe);

export default router;
