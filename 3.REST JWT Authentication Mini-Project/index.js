const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const adminRoute = require("./routers/admin.route");
const userRoute = require("./routers/user.route");
require("dotenv").config();
require("./db/connect");

const PORT = process.env.PORT || 8000;

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse requests with JSON and URL-encoded payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/admin", adminRoute); // Admin routes
app.use("/user", userRoute); // User routes

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}...`);
});
