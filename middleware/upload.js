const multer = require("multer");
const mongoose = require("mongoose");
const iconvLite = require("iconv-lite");
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
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

const checkFunction = (req, file, callback) => {
  console.log("testing multer again");
  const { password, passwordRepeat } = req.body;
  const checkPassword = password.length >= 8 && password === passwordRepeat;
  req.passwordLengthOk = password.length >= 8;
  req.passwordRepeatOk = password === passwordRepeat;
  callback(null, checkPassword);
};
const upload = multer({
  storage: storage,
  fileFilter: checkFunction,
});

module.exports = upload;
