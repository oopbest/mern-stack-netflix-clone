import express from "express";
import {
  getTrendingMovies,
  getMovieTrailers,
  getMovieDetails,
  getSimilarMovies,
  getMoviesByCategory,
} from "../controllers/movie.controller.js";

const router = express.Router();

/**
 * @openapi
 * components:
 *   parameters:
 *     MovieId:
 *       name: id
 *       in: path
 *       required: true
 *       description: TMDB movie ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 550
 *   schemas:
 *     Movie:
 *       type: object
 *       description: Common movie fields used by the frontend. Additional TMDB fields are returned unchanged; available fields vary by endpoint.
 *       additionalProperties: true
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         original_title:
 *           type: string
 *         overview:
 *           type: string
 *         poster_path:
 *           type: string
 *           nullable: true
 *         backdrop_path:
 *           type: string
 *           nullable: true
 *         release_date:
 *           type: string
 *           description: Release date in YYYY-MM-DD form, or an empty string if unavailable
 *         adult:
 *           type: boolean
 *         vote_average:
 *           type: number
 *         vote_count:
 *           type: integer
 *       example:
 *         id: 550
 *         title: Example Movie
 *         original_title: Example Movie
 *         overview: An illustrative movie response; actual values come from TMDB.
 *         poster_path: null
 *         backdrop_path: null
 *         release_date: '2025-01-01'
 *         adult: false
 *         vote_average: 7.5
 *         vote_count: 100
 *     MovieResponse:
 *       type: object
 *       required: [success, content]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         content:
 *           $ref: '#/components/schemas/Movie'
 *     MovieListResponse:
 *       type: object
 *       required: [success, content]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Movie'
 *     MovieVideo:
 *       type: object
 *       description: A TMDB video entry. Results are not filtered by site or video type, so they may include teasers, clips and other videos.
 *       additionalProperties: true
 *       properties:
 *         id:
 *           type: string
 *         key:
 *           type: string
 *           description: Video identifier on the hosting site
 *         name:
 *           type: string
 *         site:
 *           type: string
 *         type:
 *           type: string
 *         official:
 *           type: boolean
 *       example:
 *         id: example-video-id
 *         key: example-video-key
 *         name: Example Movie - Official Trailer
 *         site: YouTube
 *         type: Trailer
 *         official: true
 *     MovieTrailersResponse:
 *       type: object
 *       required: [success, trailers]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         trailers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MovieVideo'
 *   responses:
 *     MovieList:
 *       description: First page of movie results in English; content may be an empty array. Pagination metadata is not returned.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieListResponse'
 *     MovieUnauthorized:
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
 *     MovieServerError:
 *       description: Server, database or TMDB error. The current authentication middleware also returns 500 for expired or malformed JWTs.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthError'
 *           examples:
 *             upstreamError:
 *               value:
 *                 success: false
 *                 message: Request failed with status code 404
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
 * /movie/trending:
 *   get:
 *     tags: [Movies]
 *     operationId: getTrendingMovies
 *     summary: Get one random trending movie
 *     description: Selects one random movie from today's TMDB trending results in English. Repeated requests can return different movies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: One randomly selected trending movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieResponse'
 *       '401':
 *         $ref: '#/components/responses/MovieUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/MovieServerError'
 */
router.get("/trending", getTrendingMovies);

/**
 * @openapi
 * /movie/{id}/trailers:
 *   get:
 *     tags: [Movies]
 *     operationId: getMovieTrailers
 *     summary: Get videos for a movie
 *     description: Returns TMDB video entries in English, including trailers and other video types. A movie with no matching videos returns an empty trailers array.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     responses:
 *       '200':
 *         description: Videos for the selected movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieTrailersResponse'
 *       '401':
 *         $ref: '#/components/responses/MovieUnauthorized'
 *       '404':
 *         description: Movie not found on TMDB; the response body is empty
 *       '500':
 *         $ref: '#/components/responses/MovieServerError'
 */
router.get("/:id/trailers", getMovieTrailers);

/**
 * @openapi
 * /movie/{id}/details:
 *   get:
 *     tags: [Movies]
 *     operationId: getMovieDetails
 *     summary: Get movie details
 *     description: Returns movie details from TMDB in English. An unknown movie ID currently returns 500 rather than 404.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     responses:
 *       '200':
 *         description: Details for the selected movie, including additional TMDB fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieResponse'
 *       '401':
 *         $ref: '#/components/responses/MovieUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/MovieServerError'
 */
router.get("/:id/details", getMovieDetails);

/**
 * @openapi
 * /movie/{id}/similar:
 *   get:
 *     tags: [Movies]
 *     operationId: getSimilarMovies
 *     summary: Get similar movies
 *     description: Returns only the first page of similar movies from TMDB in English. Upstream failures, including not-found responses, currently return 500.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/MovieList'
 *       '401':
 *         $ref: '#/components/responses/MovieUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/MovieServerError'
 */
router.get("/:id/similar", getSimilarMovies);

/**
 * @openapi
 * /movie/{category}:
 *   get:
 *     tags: [Movies]
 *     operationId: getMoviesByCategory
 *     summary: Get movies by category
 *     description: Returns only the first page of the selected TMDB category in English. Category choices describe the lists used by this app; the controller forwards the value to TMDB without local validation.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: Movie list category
 *         schema:
 *           type: string
 *           enum: [popular, top_rated, upcoming, now_playing]
 *         example: popular
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/MovieList'
 *       '401':
 *         $ref: '#/components/responses/MovieUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/MovieServerError'
 */
router.get("/:category", getMoviesByCategory);

export default router;
