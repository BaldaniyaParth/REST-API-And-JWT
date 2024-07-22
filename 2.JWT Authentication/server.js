const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
// require("dotenv").config();
require("./db/connect");

const app = express();
// const PORT = process.env.SERVER_PORT || 8000;
const PORT = 8000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", userRoute);
app.use("/", authRoute);

app.listen(PORT, () => {
  console.log(`Server running port : ${PORT}`);
});
