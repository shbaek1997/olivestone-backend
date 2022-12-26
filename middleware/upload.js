//multer- upload, mongoose- id 생성용, iconv-lite encode/decode용
const multer = require("multer");
const mongoose = require("mongoose");
const iconvLite = require("iconv-lite");
//joi schema for data validation
const {
  fileUploadJoiSchema,
} = require("../db/schema/joi-schema/file.joi.schema");
//set up multer storage option
const storage = multer.diskStorage({
  // uploads directory
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  // custom file name: "mongoDB ID - original name"
  filename: function (req, file, callback) {
    const { originalname } = file;
    const decodedOriginalName = iconvLite.decode(originalname, "UTF-8");
    const newObjectId = new mongoose.Types.ObjectId();
    const newName = newObjectId + "-" + decodedOriginalName;
    callback(null, newName);
  },
});

//file filter function to check file form submission validity.
const checkFunction = (req, file, callback) => {
  //check password length, repeat password, and valid period
  const { password, passwordRepeat, validPeriod } = req.body;
  const result = fileUploadJoiSchema.validate({
    password,
    passwordRepeat,
    validPeriod,
  });
  //joi schema.validate return object with error if validation fails
  const error = result.error;
  const checkValid = !error ? true : false;
  //add error info to req object
  req.error = error;
  //checkValid true => file is accepted
  // check valid false => file is rejected
  callback(null, checkValid);
};
const upload = multer({
  storage: storage,
  fileFilter: checkFunction, //set file filter option
});

module.exports = upload;
