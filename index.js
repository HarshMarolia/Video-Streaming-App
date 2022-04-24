const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Video streaming
app.get("/video/:videoName", (req, res) => {
  const range = req.headers.range;
  if (!range) res.status(400).send("Range must be provided");
  let videoName = `${req.params.videoName}.mp4`;
  const videoPath = path.join(__dirname, "public", videoName);
  const videoSize = fs.statSync(videoPath).size;

  const chunkSize = 10 ** 6;

  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

// Poster Image
app.get("/:imageName", (req, res) => {
  res.sendFile(__dirname + "/public/" + req.params.imageName);
});

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});