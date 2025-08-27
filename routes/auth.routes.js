import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import {
  deleteUser,
  logoutUser,
  updateUser,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verify-middleware.js";
import { isNotAuthenticated } from "../middleware/session-middleware.js";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth Controller
 *   description: API endpoints for managing Authentication
 */

authRouter.get("/", (req, res) => {
  res.send('<a href="/auth/google">Login with google</a>');
});

authRouter.get(
  "/google",
  isNotAuthenticated,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth",
    // successRedirect: "/docs",
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
    // res.redirect(`/docs`);
  }
);

/**
 * @swagger
 * /auth/sign-up:
 *  post:
 *    tags: [Auth Controller]
 *    summary: Create a new User
 *    description: Create a new user with the provided details
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *            required:
 *              - email
 *              - password
 *    responses:
 *      201:
 *        description: User created successfully
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
authRouter.post("/sign-up", async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const newUser = await User.create({
      email,
      name,
      password,
      provider: "local",
    });
    if (newUser) {
      res.status(201).json({
        success: true,
        message: "User created successfully....",
        data: newUser,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/sign-in:
 *  post:
 *    tags: [Auth Controller]
 *    summary: Sign in a user
 *    description: Authenticate a user with email and password
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *          schema:
 *              type: object
 *              properties:
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *              required:
 *                  - email
 *                  - password
 *
 *    responses:
 *      200:
 *        description: User signed in successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
authRouter.post("/sign-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "An error occurred during authentication",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Authentication failed",
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({
          success: false,
          message: "Login failed",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Logged in successfully....",
        data: user,
      });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /auth/user/:
 *  put:
 *    tags: [Auth Controller]
 *    summary: Update user details
 *    description: Update the details of a user by their ID
 *    security:
 *       - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              avatar:
 *                type: string
 *    responses:
 *      200:
 *        description: User updated successfully
 *      400:
 *        description: Bad request
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal server error
 */
authRouter.put("/user", verifyToken, updateUser);

/**
 * @swagger
 * /auth/user/:
 *  delete:
 *    tags: [Auth Controller]
 *    summary: Delete a user
 *    description: Delete an existing user by their ID
 *    responses:
 *      200:
 *        description: User deleted successfully
 *      400:
 *        description: Bad request
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal server error
 */
authRouter.delete("/user", verifyToken, deleteUser);

/**
 * @swagger
 * /auth/logout:
 *  post:
 *    tags: [Auth Controller]
 *    summary: Logout a user
 *    description: Logout the currently authenticated user
 *    responses:
 *      200:
 *        description: User logged out successfully
 *      500:
 *        description: Internal server error
 */
authRouter.post("/logout", logoutUser);

export default authRouter;
