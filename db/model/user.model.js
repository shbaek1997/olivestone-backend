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
  //fomd all basic users
  async findBasicUsers() {
    const users = await User.find({ role: "basic-user" });
    return users;
  }
  //find all users
  async findAllUsers() {
    const users = await User.find({});
    return users;
  }

  //create new user
  async createUser(userInfo) {
    const createdNewUser = await User.create(userInfo);
    return createdNewUser;
  }
  // delete a user found by user id
  async deleteUser(userId) {
    const deletedUser = await User.findOneAndDelete({ _id: userId });
    return deletedUser;
  }
  // update user's role found by user Id with the new role
  async updateUserRole(userId, newRole) {
    const filter = { _id: userId };
    const update = { role: newRole };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
  // change user's email validation status from not verified to verified
  async updateUserEmailValidation(email) {
    const filter = { email };
    const update = { emailVerified: true };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
  // update user's password (user found by email) with new password
  async updateUserPassword(email, hashedPassword) {
    const filter = { email };
    const update = { password: hashedPassword };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
  // update user's name with the new name
  async updateUserName(email, name) {
    const filter = { email };
    const update = { fullname: name };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
    return updatedUser;
  }
}
module.exports = UserModel;
