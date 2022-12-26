//Define user schema
const mongoose = require("mongoose");
const { Schema } = mongoose;
//email as primary key
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      default: "basic-user",
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);
module.exports = { UserSchema };
