import express from "express";
import {
  getTrendingTvs,
  getTvTrailers,
  getTvDetails,
  getSimilarTvs,
  getTvsByCategory,
} from "../controllers/tv.controller.js";

const router = express.Router();

/**
 * @openapi
 * components:
 *   parameters:
 *     TvId:
 *       name: id
 *       in: path
 *       required: true
 *       description: TMDB TV show ID
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1399
 *   schemas:
 *     Tv:
 *       type: object
 *       description: Common TV show fields used by the frontend. Additional TMDB fields are returned unchanged; available fields vary by endpoint.
 *       additionalProperties: true
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         original_name:
 *           type: string
 *         overview:
 *           type: string
 *         poster_path:
 *           type: string
 *           nullable: true
 *         backdrop_path:
 *           type: string
 *           nullable: true
 *         first_air_date:
 *           type: string
 *           description: First air date in YYYY-MM-DD form, or an empty string if unavailable
 *         adult:
 *           type: boolean
 *         vote_average:
 *           type: number
 *         vote_count:
 *           type: integer
 *       example:
 *         id: 1399
 *         name: Example TV Show
 *         original_name: Example TV Show
 *         overview: An illustrative TV show response; actual values come from TMDB.
 *         poster_path: null
 *         backdrop_path: null
 *         first_air_date: '2025-01-01'
 *         adult: false
 *         vote_average: 7.5
 *         vote_count: 100
 *     TvResponse:
 *       type: object
 *       required: [success, content]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         content:
 *           $ref: '#/components/schemas/Tv'
 *     TvListResponse:
 *       type: object
 *       required: [success, content]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tv'
 *     TvVideo:
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
 *         name: Example TV Show - Official Trailer
 *         site: YouTube
 *         type: Trailer
 *         official: true
 *     TvTrailersResponse:
 *       type: object
 *       required: [success, trailers]
 *       properties:
 *         success:
 *           type: boolean
 *           enum: [true]
 *         trailers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TvVideo'
 *   responses:
 *     TvList:
 *       description: First page of TV show results in English; content may be an empty array. Pagination metadata is not returned.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TvListResponse'
 *     TvUnauthorized:
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
 *     TvServerError:
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
 * /tv/trending:
 *   get:
 *     tags: [TV]
 *     operationId: getTrendingTvs
 *     summary: Get one random trending TV show
 *     description: Selects one random TV show from today's TMDB trending results in English. Repeated requests can return different TV shows.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: One randomly selected trending TV show
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TvResponse'
 *       '401':
 *         $ref: '#/components/responses/TvUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/TvServerError'
 */
router.get("/trending", getTrendingTvs);

/**
 * @openapi
 * /tv/{id}/trailers:
 *   get:
 *     tags: [TV]
 *     operationId: getTvTrailers
 *     summary: Get videos for a TV show
 *     description: Returns TMDB video entries in English, including trailers and other video types. A TV show with no matching videos returns an empty trailers array.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TvId'
 *     responses:
 *       '200':
 *         description: Videos for the selected TV show
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TvTrailersResponse'
 *       '401':
 *         $ref: '#/components/responses/TvUnauthorized'
 *       '404':
 *         description: Tv not found on TMDB; the response body is empty
 *       '500':
 *         $ref: '#/components/responses/TvServerError'
 */
router.get("/:id/trailers", getTvTrailers);

/**
 * @openapi
 * /tv/{id}/details:
 *   get:
 *     tags: [TV]
 *     operationId: getTvDetails
 *     summary: Get TV show details
 *     description: Returns TV show details from TMDB in English. An unknown TV show ID currently returns 500 rather than 404.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TvId'
 *     responses:
 *       '200':
 *         description: Details for the selected TV show, including additional TMDB fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TvResponse'
 *       '401':
 *         $ref: '#/components/responses/TvUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/TvServerError'
 */
router.get("/:id/details", getTvDetails);

/**
 * @openapi
 * /tv/{id}/similar:
 *   get:
 *     tags: [TV]
 *     operationId: getSimilarTvs
 *     summary: Get similar TV shows
 *     description: Returns only the first page of similar TV shows from TMDB in English. Upstream failures, including not-found responses, currently return 500.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TvId'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/TvList'
 *       '401':
 *         $ref: '#/components/responses/TvUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/TvServerError'
 */
router.get("/:id/similar", getSimilarTvs);

/**
 * @openapi
 * /tv/{category}:
 *   get:
 *     tags: [TV]
 *     operationId: getTvsByCategory
 *     summary: Get TV shows by category
 *     description: Returns only the first page of the selected TMDB category in English. Category choices describe the lists used by this app; the controller forwards the value to TMDB without local validation.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: Tv list category
 *         schema:
 *           type: string
 *           enum: [popular, top_rated, on_the_air, airing_today]
 *         example: popular
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/TvList'
 *       '401':
 *         $ref: '#/components/responses/TvUnauthorized'
 *       '500':
 *         $ref: '#/components/responses/TvServerError'
 */
router.get("/:category", getTvsByCategory);


export default router;
