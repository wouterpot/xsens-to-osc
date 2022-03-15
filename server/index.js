const express = require("express");
require("dotenv").config();
const path = require("path");
const { router } = require("./routers/config");
const { pose } = require("./routers/pose");
require("./osc-sender");

const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/config", router);
app.use("/pose", pose);

module.exports = app;

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// start listening
const port = process.env.PORT || 5000;
app.set("trust proxy", "127.0.0.1");
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
