import mongoose from "mongoose";
import geminiModel from "../config/ai-model.js";
import { generateRecipePrompt } from "../lib/helper.js";
import AIRecipe from "../models/ai-recipe.model.js";

export const generateRecipe = async (req, res, next) => {
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
};

export const saveAIRecipe = async (req, res, next) => {
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
};

export const getAIRecipes = async (req, res, next) => {
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
};

export const deleteAIRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const objectId = new mongoose.Types.ObjectId(id);

    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const result = await AIRecipe.findOneAndDelete({
      _id: objectId,
      userId: userId,
    }).select("-_id -userId");
    if (!result) {
      return res.status(404).json({ message: "Recipe not found", data: null });
    }
    res.status(200).json({
      message: "Recipe deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
