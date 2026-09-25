import { fetchFromTMDB } from "../services/tmdb.service.js";

export const getTrendingMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB(
      "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
    );
    const randomMovie =
      data.results[Math.floor(Math.random() * data.results.length)];

    res.status(200).json({ success: true, content: randomMovie });
  } catch (error) {
    console.log("Error fetching trending movies: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieTrailers = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
    );
    res.status(200).json({
      success: true,
      trailers: data.results,
    });
  } catch (error) {
    console.log("Error fetching trailers: " + error);

    if (error.response?.status === 404) {
      return res.status(404).send(null);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
    );

    res.status(200).json({ success: true, content: data });
  } catch (error) {
    console.log("Error fetching movie details: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSimilarMovies = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`,
    );

    res.status(200).json({ success: true, content: data.results });
  } catch (error) {
    console.log("Error fetching similar movies: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMoviesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`,
    );

    res.status(200).json({ success: true, content: data.results });
  } catch (error) {
    console.log("Error fetching movies by category: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};
