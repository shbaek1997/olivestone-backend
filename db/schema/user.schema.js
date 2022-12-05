//Define user schema
const mongoose = require("mongoose");
const { Schema } = mongoose;
//user has username, password, role (not used for now)
const UserSchema = new Schema(
  {
    username: {
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
  },
  {
    collection: "users",
    timestamps: true,
  }
);
module.exports = { UserSchema };
