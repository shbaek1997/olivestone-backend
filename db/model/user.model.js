const mongoose = require("mongoose");
const { model } = mongoose;
const { UserSchema } = require("../schema/user.schema");

const User = model("users", UserSchema);

class UserModel {
  async findById(userId) {
    const user = await User.findOne({ _id: userId });
    return user;
  }
  async findByUsername(username) {
    const user = await User.findOne({ username });
    return user;
  }

  async createUser(userInfo) {
    const createdNewUser = await User.create(userInfo);
    return createdNewUser;
  }
}
module.exports = UserModel;
