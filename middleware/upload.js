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

// const checkFunction = (req, file, callback) => {
//   console.log("password is...");
//   console.log(req.body);
//   const { password, passwordRepeat } = req.body;
//   let err = undefined;
//   if (password.length < 8) {
//     err = { message: "파일 비밀번호는 최소 8글자이어야 합니다." };
//   } else if (password !== passwordRepeat) {
//     err = {
//       message: "파일 비밀번호와 비밀번호 확인이 일치 하지 않습니다.",
//     };
//   }
//   if (!err) {
//     console.log("it was successful!");
//     callback(null, true);
//   } else {
//     console.log("something in multer happened!");
//     callback(err, false);
//   }
// };
const upload = multer({
  storage: storage,
  // fileFilter: checkFunction,
});

module.exports = upload;
