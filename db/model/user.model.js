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
  async findByUsername(username) {
    const user = await User.findOne({ username });
    return user;
  }

  //create new user
  async createUser(userInfo) {
    const createdNewUser = await User.create(userInfo);
    return createdNewUser;
  }
}
module.exports = UserModel;
