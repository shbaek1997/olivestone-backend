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
  async deleteUser(userId) {
    const deletedUser = await User.findOneAndDelete({ _id: userId });
    return deletedUser;
  }
  async updateUserRole(userId, newRole) {
    const filter = { _id: userId };
    const update = { role: newRole };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
  async updateUserEmailValidation(email) {
    const filter = { email };
    const update = { emailVerified: true };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
  async updateUserPassword(email, hashedPassword) {
    const filter = { email };
    const update = { password: hashedPassword };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
}
module.exports = UserModel;
