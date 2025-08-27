import mongoose from "mongoose";

const aiRecipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ingredients: { type: [], required: true },
    instructions: { type: [], required: true },
    image: { type: String },
    prepTime: { type: Number },
    cookTime: { type: Number },
    totalTime: { type: Number },
    diet: { type: String },
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const AIRecipe = mongoose.model("AIRecipe", aiRecipeSchema);
export default AIRecipe;
