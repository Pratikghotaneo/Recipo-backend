import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    image: { type: String },
    videoUri: { type: String },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
