import mongoose from "mongoose";
import Recipe from "../models/recipe.model.js";

export const getALlRecipes = async (req, res) => {
  try {
    const result = await Recipe.find({});
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No recipes found", data: [] });
    }
    res.status(200).json({
      message: "Recipes fetched successfully",
      data: result,
    });
  } catch (error) {
    throw new Error(error);
  }
};
export const getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Recipe.find({ userId });
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: "No recipes found for this user", data: [] });
    }
    res.status(200).json({
      message: "User's recipes fetched successfully",
      data: result,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const createRecipe = async (req, res) => {
  try {
    const result = await Recipe.create(req.body);
    if (!result) {
      throw new Error("Failed to create recipe");
    }
    res.status(201).json({
      message: "Recipe created successfully",
      data: result,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const result = await Recipe.findByIdAndUpdate({ _id: objectId }, req.body, {
      new: true,
    }).select("-_id -userId");
    if (!result) {
      return res.status(404).json({ message: "Recipe not found", data: null });
    }
    res.status(200).json({
      message: "Recipe updated successfully",
      data: result,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const result = await Recipe.findByIdAndDelete({ _id: objectId }).select(
      "-_id -userId"
    );
    if (!result) {
      return res.status(404).json({ message: "Recipe not found", data: null });
    }
    res.status(200).json({
      message: "Recipe deleted successfully",
      data: result,
    });
  } catch (error) {
    throw new Error(error);
  }
};
