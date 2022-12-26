const UserModel = require("../db/model/user.model");
const bcrypt = require("bcrypt");
const userModel = new UserModel();

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }
  //get user by id
  async getUserById(userId) {
    const user = await this.userModel.findById(userId);
    return user;
  }

  //get user by email
  async getUserByEmail(email) {
    const user = await this.userModel.findByEmail(email);
    return user;
  }

  //get all basic-users
  async getBasicUsers() {
    const users = await this.userModel.findBasicUsers();
    return users;
  }
  // get all users
  async getAllUsers() {
    const users = await this.userModel.findAllUsers();
    return users;
  }

  //create new user
  async createNewUser(userInfo) {
    const { email, password, fullname } = userInfo;
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUserInfo = { email, fullname, password: hashedPassword };
    const createdNewUser = await this.userModel.createUser(newUserInfo);
    return createdNewUser;
  }
  //delete user
  async deleteUser(userId) {
    const result = await this.userModel.deleteUser(userId);
    return result;
  }
  //update a user's role (admin <=> basic-user)
  async updateUserRole(userInfo) {
    const userId = userInfo._id;
    const currentRole = userInfo.role;
    const isUserAdmin = currentRole === "admin";
    const newRole = isUserAdmin ? "basic-user" : "admin";
    console.log("test", userId, newRole);
    const updatedUser = await this.userModel.updateUserRole(userId, newRole);
    return updatedUser;
  }
  //update user's email verification status
  async updateUserEmailValidation(userInfo) {
    const { email } = userInfo;
    const updatedUser = await this.userModel.updateUserEmailValidation(email);
    return updatedUser;
  }
  //update user's password with the new password
  async updateUserPassword(userInfo, newPassword) {
    const { email } = userInfo;
    const salt = 10;
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const updatedUser = await this.userModel.updateUserPassword(
      email,
      hashedPassword
    );
    return updatedUser;
  }
  //update user's name
  async updateUserName(userInfo, newName) {
    const { email } = userInfo;
    const updatedUser = await this.userModel.updateUserName(email, newName);
    return updatedUser;
  }
}
const userService = new UserService(userModel);
module.exports = { userService };
