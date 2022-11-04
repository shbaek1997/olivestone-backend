const multer = require("multer");
const mongoose = require("mongoose");
const iconvLite = require("iconv-lite");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    const { originalname } = file;
    const decodedOriginalName = iconvLite.decode(originalname, "UTF-8");
    const newObjectId = new mongoose.Types.ObjectId();
    const newName = newObjectId + "-" + decodedOriginalName;
    console.log("new name", newName);
    //use some id feature here
    callback(null, newName);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
