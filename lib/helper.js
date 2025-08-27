import { UNSPLASH_ACCESS_KEY } from "../config/env.js";

export const generateRecipePrompt = (
  category,
  dietType,
  ingredients,
  prepTime
) => {
  return `
    You are an AI Recipe Generator.  
    Always respond only in valid JSON format without additional explanation.  

    Requirements:  
    1. Return a JSON object with a 5 "recipes" array.  
    2. Each item inside "recipes" must include:  
       - "id" (unique number)
       - "title" (string)  
       - "diet" (string: e.g vegetarian, vegan, non-veg, gluten-free, etc.)  
       - "imageDescription" (string: detailed description for image generation)
       - "ingredients" (array of objects with "item", "quantity", "unit")  
         * quantity must always be a number (e.g., 0.25 instead of 1/4, 0.5 instead of 1/2)  
         * if extra info like "shredded" or "chopped" is needed, include it inside "item" or add a "note" field 

       - "instructions" (array of strings, step-by-step cooking method)  
       - "prepTime" (number, minutes)  
       - "cookTime" (number, minutes)  
       - "totalTime" (number, sum of prep + cook time)  
       - "servings" (number)  
       - "nutrition" (object: calories, protein, fat, carbs as numbers)  
    3. User can specify "diet" type.  
    4. User can choose specific "ingredients" to be included/excluded.  
    5. If no ingredients and diet type are specified, suggest based on categorized meals (breakfast, lunch, snacks, dinner).  

    Generate recipes for:  
    - Category: ${category}  
    ${dietType ? `- Diet type: ${dietType}` : ""}
    ${
      ingredients && ingredients.length > 0
        ? `- Include ingredients: ${ingredients.join(", ")}`
        : ""
    }
    ${prepTime ? `- Preferred prep time: ${prepTime} minutes` : ""}

    Example JSON Output:
    {
      "recipes": [
        {
          "id": 1
          "title": "Avocado Toast",
          "diet": "vegetarian",
          "imageDescription": "A plate of spaghetti garnished with parsley and chili flakes",
          "ingredients": [
            { "item": "Bread", "quantity": 2, "unit": "slices" },
            { "item": "Avocado", "quantity": 1, "unit": "medium" }
          ],
          "instructions": [
            "Toast the bread.",
            "Mash the avocado and spread it on toast."
          ],
          "prepTime": 5,
          "cookTime": 2,
          "totalTime": 7,
          "servings": 1,
          "nutrition": {
            "calories": 250,
            "protein": 6,
            "fat": 12,
            "carbs": 28
          }
        }
      ]
    }
  `;
};

export const fetchUnsplashImage = async (query) => {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&orientation=squarish&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
    const data = await res.json();

    return data.results[0]?.urls?.small || null;
  } catch (err) {
    console.error("Unsplash fetch error:", err.message);
    return null;
  }
};
