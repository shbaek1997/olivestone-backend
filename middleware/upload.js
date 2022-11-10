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
  const { password, passwordRepeat, validPeriod } = req.body;
  const passwordLengthOk = password.length >= 8;
  const passwordRepeatOk = password === passwordRepeat;
  const validPeriodOk = validPeriod >= 1;
  const checkRequest = passwordLengthOk && passwordRepeatOk && validPeriodOk;
  req.passwordLengthOk = passwordLengthOk;
  req.passwordRepeatOk = passwordRepeatOk;
  req.validPeriodOk = validPeriodOk;
  //checkPassword 가 true이면 파일이 accept되고, false이면 reject된다.
  callback(null, checkRequest);
};
const upload = multer({
  storage: storage,
  fileFilter: checkFunction, //set file filter option
});

module.exports = upload;
