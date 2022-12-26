// express router
const express = require("express");
const userRouter = express.Router();
//passport and jwt for user authentication
const passport = require("passport");
const jwt = require("jsonwebtoken");
// check login middleware
const { loginRequired } = require("../middleware/auth-jwt");
const { adminRequired } = require("../middleware/admin-required");
//user service
const { emailService } = require("../service/email.service");
const { userService } = require("../service/user.service");
const bcrypt = require("bcrypt");
const {
  userRegisterJoiSchema,
  userIdJoiSchema,
  userPasswordResetJoiSchema,
  userPasswordUpdateJoiSchema,
  userNameUpdateJoiSchema,
} = require("../db/schema/joi-schema/user.joi.schema");
const { superUserRequired } = require("../middleware/super-user-required");

// get request with passport middleware to check if user is logged in
userRouter.get("/auth", loginRequired, (req, res, next) => {
  const { user } = req;
  res.json({ user });
});

//get all basic-users for admin users
userRouter.get(
  "/basic-users",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const users = await userService.getBasicUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }
);

//get all users -for super-user
userRouter.get(
  "/all",
  loginRequired,
  superUserRequired,
  async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }
);

//user register post request to create new user (only allowed for admin/super-user)
userRouter.post(
  "/register",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      //body contains all the user info required
      //body should have email, fullname, password, repeat password
      const { body } = req;
      const { email, fullname, password, passwordRepeat } = body;
      //check if user already exists for submitted email
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new Error(
          "해당 이메일은 이미 사용중입니다. 다른 이메일을 사용해주세요"
        );
      }
      //validate data in form submitted
      await userRegisterJoiSchema.validateAsync({
        email,
        fullname,
        password,
        passwordRepeat,
      });
      //create new user as basic-user
      const newUser = await userService.createNewUser({
        email,
        fullname,
        password,
        passwordRepeat,
      });
      res.json({ user: newUser });
    } catch (error) {
      next(error);
    }
  }
);
// api for sending validation (confirmation) email for newly registered user
userRouter.post(
  "/register/email",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { body } = req;
      const { email } = body;
      //check if user exists for registered email
      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new Error("해당 이메일을 가진 유저가 없습니다.");
      }
      //send validation email
      await emailService.sendValidationMail(email);
      res.json({ result: "인증 이메일이 정상적으로 발송되었습니다." });
    } catch (error) {
      next(error);
    }
  }
);

// user login post request using passport.authenticate with local strategy
userRouter.post("/login", async (req, res, next) => {
  try {
    //using jwt, so session is false
    passport.authenticate("local", { session: false }, (error, user, info) => {
      // user is user object if validated otherwise user becomes false boolean
      if (error || !user) {
        // passport fail or user = false
        // error message is in info variable
        console.log(error);
        console.log(info);
        const { message } = info;
        // respond error
        res.status(400).json({
          result: "error",
          reason: message,
        });
        return;
      }
      // if user was present check login
      req.login(user, { session: false }, (loginError) => {
        // if login error send login error
        if (loginError) {
          res.status(400).send(loginError);
          return;
        }
        //if everything was successful
        // sign jwt token using secret key
        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          secretKey,
          {
            expiresIn: "7d",
          }
        );
        // respond with token, role and user id
        res.status(200).json({
          token,
          userId: user._id,
          role: user.role,
        });
      });
    })(req, res);
  } catch (error) {
    next(error);
  }
});
// api for sending reset-password email with reset-token
userRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    //check user with the submitted email exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new Error("해당 이메일의 유저는 존재하지 않습니다.");
    }
    //expire date of token
    const expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    //set payload of jwt
    const payload = { user, expireDate };
    //create token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    //send email with token
    await emailService.sendPasswordResetEmail(email, token);
    res.json({ result: "비밀번호 리셋 이메일이 정상적으로 발송되었습니다." });
  } catch (error) {
    next(error);
  }
});

//api to check reset-password-token
userRouter.get("/reset-password/check-token", async (req, res, next) => {
  try {
    const { token } = req.query;
    //get payload from token
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { user, expireDate } = payload;
    //if expire date expired.. -send new token and alert user (front end bit, make validation page)
    const timeNow = new Date();
    const expireDateObj = new Date(expireDate);
    if (timeNow > expireDateObj) {
      const newExpireDate = new Date(timeNow.getTime() + 24 * 60 * 60 * 1000);
      const newPayload = { user, newExpireDate };
      const { email } = user;
      const newToken = jwt.sign(newPayload, process.env.JWT_SECRET_KEY);
      await emailService.sendPasswordResetEmail(email, newToken);
      throw new Error(
        "리셋 이메일의 유효기간이 만료되어 새 인증메일을 발송했습니다."
      );
    }
    //otherwise send user as response
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
// delete registered user
userRouter.delete(
  "/:userId",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      //check user role
      const userAccessRole = req.user.role;
      //validate user id format
      await userIdJoiSchema.validateAsync({ userId });
      // check if user exists
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      // check role of the user found
      const { role } = user;
      //admin user cannot delete other admin users
      if (role === "admin" && userAccessRole === "admin") {
        throw new Error("관리자 권한으로 관리자 계정을 삭제할 수 없습니다.");
      }
      //delete user found
      const result = await userService.deleteUser(userId);
      res.json({ user: result });
    } catch (error) {
      next(error);
    }
  }
);

//verify email of newly registered user after sign up
userRouter.get("/verify", async (req, res, next) => {
  try {
    const { token } = req.query;
    //get payload info from token
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { email, expireDate } = payload;
    //if expire date of token is expired.. -send new token and alert user (front end bit, make validation page)
    const timeNow = new Date();
    const expireDateObj = new Date(expireDate);
    if (timeNow > expireDateObj) {
      emailService.sendValidationMail(email);
      throw new Error(
        "인증 이메일의 유효기간이 만료되어 새 인증메일을 발송했습니다."
      );
    }
    //check if user exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new Error("해당 유저의 가입기록이 없습니다.");
    }
    //check verified status of the user
    const { emailVerified } = user;
    if (emailVerified) {
      throw new Error("해당 유저는 이미 인증을 완료했습니다.");
    }
    //update user's email verification status
    const userInfo = user;
    const updatedUser = await userService.updateUserEmailValidation(userInfo);

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});
// patch user's password - password change by password reset email
userRouter.patch("/:userId/reset-password/password", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { password, passwordRepeat } = req.body;
    // validate format of password submitted
    await userPasswordResetJoiSchema.validateAsync({
      userId,
      password,
      passwordRepeat,
    });
    //check if the user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
    }
    //update user's password
    const updatedUser = await userService.updateUserPassword(user, password);
    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});

//change name of the user
userRouter.patch(
  "/:userId/change-name",
  loginRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      //find user with the user id
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      //check user id validity
      const isUserMatch = userId === String(user._id);
      if (!isUserMatch) {
        throw new Error(
          "현재 로그인한 유저와 api 유저 아이디가 일치하지 않습니다."
        );
      }
      //get user info
      const hashedPassword = user.password;
      const { name, password } = req.body;
      //check if password is correct
      const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordCorrect) {
        throw new Error("현재 비밀번호가 틀렸습니다.");
      }
      //validate name, password
      await userNameUpdateJoiSchema.validateAsync({
        name,
        password,
      });
      //update name of the user
      const updatedUser = await userService.updateUserName(user, name);
      res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

//change the password of the user
userRouter.patch(
  "/:userId/change-password",
  loginRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      //find user with the user id
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      const { password } = user;
      // check user id validity
      const isUserMatch = userId === String(user._id);
      if (!isUserMatch) {
        throw new Error(
          "현재 로그인한 유저와 api 유저 아이디가 일치하지 않습니다."
        );
      }
      const { newPassword, newPasswordRepeat, oldPassword } = req.body;
      //check if the password matches
      const isPasswordCorrect = await bcrypt.compare(oldPassword, password);
      if (!isPasswordCorrect) {
        throw new Error("현재 비밀번호가 틀렸습니다.");
      }
      //validate submitted password
      await userPasswordUpdateJoiSchema.validateAsync({
        newPassword,
        newPasswordRepeat,
        oldPassword,
      });
      //update user with the new password

      const updatedUser = await userService.updateUserPassword(
        user,
        newPassword
      );
      res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

//change the role of the user (admin <=> basic-user) only by super user
userRouter.patch(
  "/role/:userId",
  loginRequired,
  superUserRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      //validate user id format
      await userIdJoiSchema.validateAsync({ userId });
      //find user
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      const userInfo = user;
      //update user role based userInfo
      const updatedUser = await userService.updateUserRole(userInfo);
      res.json({ updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = userRouter;
