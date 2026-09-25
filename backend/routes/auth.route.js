// backend/routes/auth.route.js
import express from "express";
import {
  signup,
  login,
  logout,
  authCheck,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: jwt-netflix
 *       description: Log in or sign up first on the same backend origin. The browser sends the HttpOnly cookie automatically; do not paste a token into Authorize.
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           enum: ['']
 *           description: Always returned as an empty string
 *         image:
 *           type: string
 *         searchHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: TMDB ID
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 nullable: true
 *               searchType:
 *                 type: string
 *                 enum: [movie, tv, person]
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         __v:
 *           type: integer
 *     AuthUserResponse:
 *       type: object
 *       required: [success, user]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *       example:
 *         success: true
 *         user:
 *           _id: '507f1f77bcf86cd799439011'
 *           username: moviefan
 *           email: user@example.com
 *           password: ''
 *           image: /avatar1.png
 *           searchHistory: []
 *           __v: 0
 *     AuthError:
 *       type: object
 *       required: [success, message]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [false]
 *         message:
 *           type: string
 *           description: Error message returned by the server; varies by failure
 *   headers:
 *     AuthSessionCookie:
 *       description: Sets the HttpOnly jwt-netflix cookie with SameSite=Strict and a 15-day cookie lifetime. The JWT expires after 1 day. Secure is enabled unless NODE_ENV=development; use HTTPS in other environments.
 *       schema:
 *         type: string
 *   responses:
 *     AuthServerError:
 *       description: Internal server error; the response message comes from the caught error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthError'
 *           example:
 *             success: false
 *             message: Internal server error
 */

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     operationId: signup
 *     summary: Create an account and log in
 *     description: Creates a user and sets the session cookie on success.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 1
 *                 example: moviefan
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 writeOnly: true
 *     responses:
 *       '201':
 *         description: Account created; sets the jwt-netflix cookie
 *         headers:
 *           Set-Cookie:
 *             $ref: '#/components/headers/AuthSessionCookie'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       '400':
 *         description: Missing fields, invalid email, short password, or an existing username/email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             examples:
 *               missingFields:
 *                 value:
 *                   success: false
 *                   message: All fields are required
 *               invalidEmail:
 *                 value:
 *                   success: false
 *                   message: Invalid email
 *               shortPassword:
 *                 value:
 *                   success: false
 *                   message: Password must be at least 6 characters
 *               usernameExists:
 *                 value:
 *                   success: false
 *                   message: Username already exists
 *               emailExists:
 *                 value:
 *                   success: false
 *                   message: Email already exists
 *       '500':
 *         $ref: '#/components/responses/AuthServerError'
 */
router.post("/signup", signup);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     operationId: login
 *     summary: Log in to your account
 *     description: Execute this with your account credentials before trying authCheck. When using Swagger UI on the backend origin, the browser stores and sends the HttpOnly session cookie automatically.
 *     security: []
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 writeOnly: true
 *     responses:
 *       '200':
 *         description: Login successful; sets the jwt-netflix cookie
 *         headers:
 *           Set-Cookie:
 *             $ref: '#/components/headers/AuthSessionCookie'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       '400':
 *         description: Missing credentials, user not found, or invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             examples:
 *               invalidPassword:
 *                 value:
 *                   success: false
 *                   message: Invalid password
 *               missingFields:
 *                 value:
 *                   success: false
 *                   message: All fields are required
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   message: User not found
 *       '500':
 *         $ref: '#/components/responses/AuthServerError'
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     operationId: logout
 *     summary: Log out of your account
 *     description: Clears the browser's session cookie. Also succeeds if no cookie is present. This endpoint does not revoke previously issued JWTs on the server.
 *     security: []
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Expires the jwt-netflix cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, message]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   enum: [true]
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               message: Logged out successfully
 *       '500':
 *         $ref: '#/components/responses/AuthServerError'
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/authCheck:
 *   get:
 *     tags: [Auth]
 *     operationId: authCheck
 *     summary: Get the current authenticated user
 *     description: Requires the jwt-netflix cookie from login or signup. The current middleware returns 500 for an expired or malformed JWT.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Current authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       '401':
 *         description: Session cookie missing or the user no longer exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             examples:
 *               missingCookie:
 *                 value:
 *                   success: false
 *                   message: Unauthorized - No token found
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   message: User not found
 *       '500':
 *         description: Internal server error or JWT verification failure (current middleware behavior)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             examples:
 *               expiredToken:
 *                 value:
 *                   success: false
 *                   message: jwt expired
 *               malformedToken:
 *                 value:
 *                   success: false
 *                   message: jwt malformed
 *               serverError:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 */
router.get("/authCheck", protectRoute, authCheck);

export default router;
