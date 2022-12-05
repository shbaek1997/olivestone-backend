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

  //get user by username
  async getUserByUsername(username) {
    const user = await this.userModel.findByUsername(username);
    return user;
  }

  //create new user
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
