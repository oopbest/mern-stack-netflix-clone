import { fetchFromTMDB } from "../services/tmdb.service.js";
import User from "../models/user.model.js";

export const searchPerson = async (req, res) => {
  try {
    const { query } = req.params;
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );

    if (response.results.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          searchHistory: {
            id: response.results[0].id,
            title: response.results[0].name,
            image: response.results[0].profile_path,
            searchType: "person",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log("Error fetching person: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const searchMovie = async (req, res) => {
  try {
    const { query } = req.params;
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );

    if (response.results.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          searchHistory: {
            id: response.results[0].id,
            title: response.results[0].title,
            image: response.results[0].poster_path,
            searchType: "movie",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log("Error fetching movie: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const searchTv = async (req, res) => {
  try {
    const { query } = req.params;
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
    );

    if (response.results.length === 0)
      return res.status(404).json({ success: false, message: "Tv not found" });

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          searchHistory: {
            id: response.results[0].id,
            title: response.results[0].name,
            image: response.results[0].poster_path,
            searchType: "tv",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log("Error fetching tv: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// searchHistory
export const getSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("searchHistory");
    res.status(200).json({ success: true, content: user.searchHistory });
  } catch (error) {
    console.log("Error fetching search history: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const removeFromSearchHistory = async (req, res) => {
  try {
    const targetId = Number(req.params.id); // TMDB ids are numbers
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { searchHistory: { id: targetId } },
    });

    const updated = await User.findById(req.user._id).select("searchHistory");
    res.status(200).json({ success: true, content: updated.searchHistory });
  } catch (error) {
    console.log("Error removing from search history: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};
