// import { UserModel } from "../db/model/user.model";
const UserModel = require("../db/model/user.model");
const bcrypt = require("bcrypt");
const userModel = new UserModel();

class UserService {
  constructor(userModel) {
    this.userModel = userModel;
  }
  async getUserById(userId) {
    const user = await this.userModel.findById(userId);
    return user;
  }
  async getUserByUsername(username) {
    const user = await this.userModel.findByUsername(username);
    return user;
  }
  async createNewUser(userInfo) {
    const { username, password } = userInfo;
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUserInfo = { username, password: hashedPassword };
    const createdNewUser = await this.userModel.createUser(newUserInfo);
    return createdNewUser;
  }
}
const userService = new UserService(userModel);
module.exports = { userService };
