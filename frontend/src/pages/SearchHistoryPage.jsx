import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { SMALL_IMG_BASE_URL } from "../utils/constants";
import { Trash } from "lucide-react";

function SearchHistoryPage() {
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const getSearchHistory = async () => {
      try {
        const response = await axios.get("/api/v1/search/history");
        setSearchHistory(response.data.content);
      } catch (error) {
        console.log("Error fetching search history: " + error);
        setSearchHistory([]);
      }
    };
    getSearchHistory();
  }, []);

  // console.log(searchHistory);
  if (searchHistory.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Search History</h1>
          <div className="flex justify-center items-center h-96">
            <p className="text-xl">No search history found</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (item) => {
    try {
      await axios.delete(`/api/v1/search/history/${item.id}`);
      setSearchHistory((prev) =>
        prev.filter((result) => result.id !== item.id),
      );
    } catch (error) {
      console.log("Error deleting search history: " + error);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search History</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchHistory.map((result, index) => {
            // if (!result.image) return null;
            return (
              <div
                key={index}
                className="bg-gray-800 rounded flex items-start p-4"
              >
                <img
                  src={SMALL_IMG_BASE_URL + result.image}
                  alt="History image"
                  className="size-16 rounded-full object-cover mr-4"
                />
                <div className="flex flex-col">
                  <span className="text-white">{result.title}</span>
                  <span className="text-gray-400">
                    {formatDate(result.createdAt)}
                  </span>
                </div>

                <span
                  className={`py-1 px-3 min-w-20 text-center rounded-full text-sm ml-auto ${
                    result.searchType === "movie"
                      ? "bg-red-600"
                      : result.searchType === "tv"
                        ? "bg-blue-600"
                        : "bg-green-600"
                  }`}
                >
                  {result.searchType[0].toUpperCase() +
                    result.searchType.slice(1)}
                </span>
                <Trash
                  className="size-5 ml-4 cursor-pointer hover:fill-red-600"
                  onClick={() => handleDelete(result)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchHistoryPage;
