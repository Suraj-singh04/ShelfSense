// middlewares/multer.js

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Only image files are allowed!", false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
