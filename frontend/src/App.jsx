import { useState } from "react";
import axios from "axios";
import {
  FaYoutube,
  FaInstagram,
  FaMusic,
  FaDownload,
} from "react-icons/fa";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [url, setUrl] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVideo = async () => {
    if (!url) {
      return alert("Paste URL first");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/video-info`,
        {
          url,
        }
      );

      setVideo(res.data);
    } catch (error) {
      alert("Failed to fetch video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>
        <FaYoutube color="red" /> Media Downloader{" "}
        <FaInstagram color="#E1306C" />
      </h1>

      <p className="subtitle">
        Download YouTube videos & Instagram reels
      </p>

      <div className="inputBox">
        <input
          type="text"
          placeholder="Paste YouTube or Instagram URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button onClick={fetchVideo}>
          {loading ? "Loading..." : "Get Video"}
        </button>
      </div>

      {video && (
        <div className="card">
          <img src={video.thumbnail} alt="" />

          <h2>{video.title}</h2>

          <div className="formats">
            {video.formats.map((item, index) => (
              <a
                key={index}
                href={`${API_URL}/download?url=${encodeURIComponent(
                  url
                )}&formatId=${item.formatId}`}
                target="_blank"
              >
                <FaDownload />
                Download {item.quality}
              </a>
            ))}
          </div>

          <a
            href={`${API_URL}/mp3?url=${encodeURIComponent(
              url
            )}`}
            target="_blank"
            className="mp3"
          >
            <FaMusic />
            Download MP3
          </a>
        </div>
      )}
    </div>
  );
}

export default App;