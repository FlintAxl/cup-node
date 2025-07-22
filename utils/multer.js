const multer = require("multer");
const path = require("path");

// Configure multer storage settings
// This will save uploaded files in the 'images' directory
// and rename them to include a unique suffix to avoid conflicts
// It will also ensure that the file extension is preserved
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        let baseName = path.parse(file.originalname).name.replace(/\\/g, '/');
        cb(null, baseName + '-' + uniqueSuffix + ext);
       
    }
});
// Configure multer to use the storage settings
// and to filter file types
// This will only allow .jpg, .jpeg, and .png files
module.exports = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            cb(new Error("Unsupported file type!"), false);
            return;
        }
        cb(null, true);
    },
});


