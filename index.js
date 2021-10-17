const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");
const { join } = require("path");
require("dotenv/config");

app.use(cors({ origin: true }));

app.get("/", (req, res) => {
  try {
    if (!req.query.url) return res.send("Specify 'url' query parameter to cache the image");

    res.set("Cache-Control", "public, max-age=999999");

    const fileDir = join(__dirname, "images", encodeURIComponent(req.query.url));

    if (fs.existsSync(join(__dirname, "images", encodeURIComponent(req.query.url)))) {
      const file = fs.readdirSync(fileDir)[0];
      return res.sendFile(join(fileDir, file));
    }

    fetch(req.query.url).then((response) => {
      const contentType = response.headers.get("content-type");

      if (!contentType.startsWith("image")) return res.status(400).send("Not an image");

      fs.mkdirSync(join("images", encodeURIComponent(req.query.url)), { recursive: true });

      const filePath = join(fileDir, `image.${contentType.replace("image/", "")}`);

      response.body.pipe(fs.createWriteStream(filePath)).on("close", () => {
        res.sendFile(filePath);
      });
    });
  } catch (error) {
    console.log(error);
    if (!res.headersSent) res.sendStatus(500);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
