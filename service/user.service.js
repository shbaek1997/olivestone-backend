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
  async getUserByEmail(email) {
    const user = await this.userModel.findByEmail(email);
    return user;
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
}
const userService = new UserService(userModel);
module.exports = { userService };
