import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "./env.js";

// Configure
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

//Initialise Model
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig,
});

export default geminiModel;
