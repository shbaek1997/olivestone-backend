//multer- upload, mongoose- id 생성용, iconv-lite encode/decode용
const multer = require("multer");
const mongoose = require("mongoose");
const iconvLite = require("iconv-lite");

//set up multer storage option
const storage = multer.diskStorage({
  // uploads directory
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  // custom file name: mongoDB ID - original name
  filename: function (req, file, callback) {
    const { originalname } = file;
    const decodedOriginalName = iconvLite.decode(originalname, "UTF-8");
    const newObjectId = new mongoose.Types.ObjectId();
    const newName = newObjectId + "-" + decodedOriginalName;
    callback(null, newName);
  },
});

const checkFunction = (req, file, callback) => {
  //check password length and match with repeat password
  const { password, passwordRepeat } = req.body;
  const checkPassword = password.length >= 8 && password === passwordRepeat;
  req.passwordLengthOk = password.length >= 8;
  req.passwordRepeatOk = password === passwordRepeat;
  callback(null, checkPassword);
};
const upload = multer({
  storage: storage,
  fileFilter: checkFunction, //set file filter option
});

module.exports = upload;
