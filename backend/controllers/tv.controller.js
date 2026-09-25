import { fetchFromTMDB } from "../services/tmdb.service.js";

export const getTrendingTvs = async (req, res) => {
  try {
    const data = await fetchFromTMDB(
      "https://api.themoviedb.org/3/trending/tv/day?language=en-US",
    );
    const randomTv =
      data.results[Math.floor(Math.random() * data.results.length)];

    res.status(200).json({ success: true, content: randomTv });
  } catch (error) {
    console.log("Error fetching trending tvs: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTvTrailers = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`,
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

export const getTvDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
    );

    res.status(200).json({ success: true, content: data });
  } catch (error) {
    console.log("Error fetching tv details: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSimilarTvs = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/tv/${id}/similar?language=en-US&page=1`,
    );

    res.status(200).json({ success: true, content: data.results });
  } catch (error) {
    console.log("Error fetching similar tvs: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTvsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/tv/${category}?language=en-US&page=1`,
    );

    res.status(200).json({ success: true, content: data.results });
  } catch (error) {
    console.log("Error fetching tvs by category: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};
