const multer = require("multer");
const mongoose = require("mongoose");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    const { originalname } = file;
    const newObjectId = new mongoose.Types.ObjectId();
    const newName = originalname + "-" + newObjectId;
    //use some id feature here
    callback(null, newName);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
