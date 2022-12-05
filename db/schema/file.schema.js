//Define file schema
const mongoose = require("mongoose");
const { Schema } = mongoose;
//file has id, original file name, file password, directory path, mime type, valid period in days, expire date
const FileSchema = new Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    validPeriod: {
      type: Number, //in days
      required: true,
    },
    expireDate: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "files",
    timestamps: true,
  }
);
module.exports = { FileSchema };
