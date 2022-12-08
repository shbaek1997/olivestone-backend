//use mongoose ODM and user schema
const mongoose = require("mongoose");
const { model } = mongoose;
const { UserSchema } = require("../schema/user.schema");

const User = model("users", UserSchema);

// model with find one user by user id, find one user by username, create one user.
class UserModel {
  //find a user by user id
  async findById(userId) {
    const user = await User.findOne({ _id: userId });
    return user;
  }
  //find a user by username
  async findByEmail(email) {
    const user = await User.findOne({ email });
    return user;
  }
  async findBasicUsers() {
    const users = await User.find({ role: "basic-user" });
    return users;
  }
  async findAllUsers() {
    const users = await User.find({});
    return users;
  }

  //create new user
  async createUser(userInfo) {
    const createdNewUser = await User.create(userInfo);
    return createdNewUser;
  }
}
module.exports = UserModel;
