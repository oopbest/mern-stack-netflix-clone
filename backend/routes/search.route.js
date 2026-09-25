import express from "express";
import {
  searchPerson,
  searchMovie,
  searchTv,
  getSearchHistory,
  removeFromSearchHistory,
} from "../controllers/search.controller.js";

const router = express.Router();

/**
 * @openapi
 * components:
 *   parameters:
 *     SearchQuery:
 *       name: query
 *       in: path
 *       required: true
 *       description: Search text. Enter plain text in Swagger UI; when calling the API directly, URL-encode the path segment.
 *       schema:
 *         type: string
 *         minLength: 1
 *       example: Batman
 *     SearchHistoryId:
 *       name: id
 *       in: path
 *       required: true
 *       description: TMDB ID from a search history entry; this is not a unique history entry ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 550
 *   schemas:
 *     SearchPerson:
 *       type: object
 *       description: Common person fields from TMDB. Additional fields are returned unchanged.
 *       additionalProperties: true
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         profile_path:
 *           type: string
 *           nullable: true
 *         known_for_department:
 *           type: string
 *         known_for:
 *           type: array
 *           items:
 *             anyOf:
 *               - $ref: '#/components/schemas/Movie'
 *               - $ref: '#/components/schemas/Tv'
 *       example:
 *         id: 123
 *         name: Example Person
 *         profile_path: null
 *         known_for_department: Acting
 *         known_for: []
 *     SearchPersonResponse:
 *       type: object
 *       required: [success, content]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SearchPerson'
 *     SearchHistoryEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: TMDB ID, shared by repeated searches for the same result
 *         title:
 *           type: string
 *           description: Movie title, TV show name or person name of the first search result
 *         image:
 *           type: string
 *           nullable: true
 *           description: TMDB poster path or person profile path
 *         searchType:
 *           type: string
 *           enum: [movie, tv, person]
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 550
 *         title: Example Movie
 *         image: null
 *         searchType: movie
 *         createdAt: '2026-01-01T12:00:00.000Z'
 *     SearchHistoryResponse:
 *       type: object
 *       required: [success, content]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SearchHistoryEntry'
 *   responses:
 *     SearchHistory:
 *       description: Current user's search history in stored order; content is an empty array if no entries remain
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchHistoryResponse'
 *     SearchUnauthorized:
 *       description: Session cookie missing or the user no longer exists. Log in first on the same backend origin.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthError'
 *           examples:
 *             missingCookie:
 *               value:
 *                 success: false
 *                 message: Unauthorized - No token found
 *             userNotFound:
 *               value:
 *                 success: false
 *                 message: User not found
 *     SearchServerError:
 *       description: Server, database or TMDB error. The current authentication middleware also returns 500 for expired or malformed JWTs.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthError'
 *           examples:
 *             expiredToken:
 *               value:
 *                 success: false
 *                 message: jwt expired
 *             serverError:
 *               value:
 *                 success: false
 *                 message: Internal server error
 */

/**
 * @openapi
 * /search/person/{query}:
 *   get:
 *     tags: [Search]
 *     operationId: searchPerson
 *     summary: Search for people
 *     description: Searches TMDB in English with adult results excluded and returns the first page. A successful search appends the FIRST result to your history; repeating the request creates another entry. No results returns 404 without adding history. Pagination metadata is not returned.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       '200':
 *         description: Matching people; the first result was saved to search history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchPersonResponse'
 *       '401':
 *         $ref: '#/components/responses/SearchUnauthorized'
 *       '404':
 *         description: No matching people found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             example:
 *               success: false
 *               message: Person not found
 *       '500':
 *         $ref: '#/components/responses/SearchServerError'
 */
router.get("/person/:query", searchPerson);

/**
 * @openapi
 * /search/movie/{query}:
 *   get:
 *     tags: [Search]
 *     operationId: searchMovie
 *     summary: Search for movies
 *     description: Searches TMDB in English with adult results excluded and returns the first page. A successful search appends the FIRST result to your history; repeating the request creates another entry. No results returns 404 without adding history. Pagination metadata is not returned.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       '200':
 *         description: Matching movies; the first result was saved to search history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieListResponse'
 *       '401':
 *         $ref: '#/components/responses/SearchUnauthorized'
 *       '404':
 *         description: No matching movies found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             example:
 *               success: false
 *               message: Movie not found
 *       '500':
 *         $ref: '#/components/responses/SearchServerError'
 */
router.get("/movie/:query", searchMovie);

/**
 * @openapi
 * /search/tv/{query}:
 *   get:
 *     tags: [Search]
 *     operationId: searchTv
 *     summary: Search for TV shows
 *     description: Searches TMDB in English with adult results excluded and returns the first page. A successful search appends the FIRST result to your history; repeating the request creates another entry. No results returns 404 without adding history. Pagination metadata is not returned.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       '200':
 *         description: Matching TV shows; the first result was saved to search history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TvListResponse'
 *       '401':
 *         $ref: '#/components/responses/SearchUnauthorized'
 *       '404':
 *         description: No matching TV shows found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *             example:
 *               success: false
 *               message: Tv not found
 *       '500':
 *         $ref: '#/components/responses/SearchServerError'
 */
router.get("/tv/:query", searchTv);

// searchHistory
/**
 * @openapi
 * /search/history:
 *   get:
 *     tags: [Search]
 *     operationId: getSearchHistory
 *     summary: Get your search history
 *     description: Returns all stored entries for the authenticated user. Repeated searches can produce duplicate entries; no pagination or explicit sorting is applied.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SearchHistory'
 *       '401':
 *         $ref: '#/components/responses/SearchUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/SearchServerError'
 */
router.get("/history", getSearchHistory);

/**
 * @openapi
 * /search/history/{id}:
 *   delete:
 *     tags: [Search]
 *     operationId: removeFromSearchHistory
 *     summary: Remove search history entries by TMDB ID
 *     description: Removes ALL entries with the given TMDB ID from the authenticated user's history, including duplicates and entries of other search types with that ID. Returns the remaining history. An ID absent from history also succeeds with 200.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchHistoryId'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SearchHistory'
 *       '401':
 *         $ref: '#/components/responses/SearchUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/SearchServerError'
 */
router.delete("/history/:id", removeFromSearchHistory);

export default router;
