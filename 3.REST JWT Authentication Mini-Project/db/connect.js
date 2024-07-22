const mongoose = require("mongoose");

// Connecting to the MongoDB database
mongoose
  .connect("mongodb://127.0.0.1:27017/internship") 
  .then(() => {
    console.log("MongoDB connection successfully..."); 
  })
  .catch((err) => {
    console.log(err); 
  });
