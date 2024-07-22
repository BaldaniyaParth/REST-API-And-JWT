const mongoose = require("mongoose"); 

// Define the schema for the admin collection
const adminSchema = new mongoose.Schema({
    email : {
        type : String,
        require : true 
    },
    password : {
        type : String,
        require : true 
    },
    token: {
        type: String,
        default: "",
    },
})

module.exports = mongoose.model("Admin", adminSchema); // Export the Admin model based on the adminSchema
