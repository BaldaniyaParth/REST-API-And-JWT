const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/auth-apis")
  .then(() => {
    console.log("Connected Successfully in DB");
  })
  .catch((err) => {
    console.log(err);
  });
