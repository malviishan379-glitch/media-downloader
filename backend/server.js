const express = require("express");
const cors = require("cors");
const ytDlp = require("yt-dlp-exec");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg-static");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Running...");
});

app.post("/video-info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const info = await ytDlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });

    const uniqueFormats = [
      {
        quality: "HD",
        formatId: "bestvideo+bestaudio/best",
      },
    ];

    res.json({
      success: true,
      title: info.title,
      thumbnail: info.thumbnail,
      formats: uniqueFormats,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch video info",
    });
  }
});

app.get("/download", async (req, res) => {
  try {
    const { url, formatId } = req.query;

    if (!url) {
      return res.status(400).send("URL missing");
    }

    const fileName = `video-${Date.now()}.mp4`;

    const outputPath = path.join(
      __dirname,
      "downloads",
      fileName
    );

    await ytDlp(url, {
      output: outputPath,
      format: formatId || "bestvideo+bestaudio/best",
      mergeOutputFormat: "mp4",
      ffmpegLocation: ffmpeg,
    });

    res.download(outputPath, () => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Download failed");
  }
});

app.get("/mp3", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("URL missing");
    }

    const fileName = `audio-${Date.now()}.mp3`;

    const outputPath = path.join(
      __dirname,
      "downloads",
      fileName
    );

    await ytDlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      ffmpegLocation: ffmpeg,
      output: outputPath,
    });

    res.download(outputPath, () => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("MP3 download failed");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});