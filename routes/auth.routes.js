import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signInSchema, signUpSchema } from "../validators/auth.validator.js";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and session management
 */

/**
 * @swagger
 * /api/v1/auth/sign-up:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Aditya Srivastava
 *               email:
 *                 type: string
 *                 format: email
 *                 example: aditya@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
authRouter.post("/sign-up", validate(signUpSchema), signUp);

/**
 * @swagger
 * /api/v1/auth/sign-in:
 *   post:
 *     summary: Sign in with existing credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: aditya@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Signed in successfully
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/sign-in", validate(signInSchema), signIn);

/**
 * @swagger
 * /api/v1/auth/sign-out:
 *   post:
 *     summary: Sign out and blacklist active token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signed out successfully
 */
authRouter.post("/sign-out", signOut);

export default authRouter;

