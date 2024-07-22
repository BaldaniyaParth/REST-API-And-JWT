const multer = require("multer");

// Exporting a middleware function named 'uploader' that utilizes multer
exports.uploader = multer({
    storage : multer.diskStorage({}),
    limits : {fileSize : 500000} // 500000 bytes = 500 KB
})
