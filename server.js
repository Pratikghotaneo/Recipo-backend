import express from "express";
import cors from "cors";
import "./lib/auth.js";

import recipeRouter from "./routes/recipesRoutes.js";
import swaggerDocs from "./lib/swagger.js";
import connectToDB from "./config/connection.js";
import errormiddleware from "./middleware/error-middleware.js";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import session from "express-session";
import { JWT_SECRET } from "./config/env.js";
import aiRecipesRouter from "./routes/ai-recipes.routes.js";  

const app = express(); 
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({ secret: JWT_SECRET, resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(recipeRouter);
app.use("/auth", authRouter);
app.use("/ai", aiRecipesRouter);

app.use(errormiddleware);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  swaggerDocs(app, PORT);
  await connectToDB();
});
