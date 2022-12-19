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

//get all users except super user
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

//user register post request to create new user (only for first user)
//not used unless register page is made
userRouter.post(
  "/register",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      //body contains all the user info required
      //body should have password, repeat password, username
      //check for repeating username..
      //check validity of password, password repeat
      //then create new user
      const { body } = req;
      const { email, fullname, password, passwordRepeat } = body;

      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new Error(
          "해당 이메일은 이미 사용중입니다. 다른 이메일을 사용해주세요"
        );
      }
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

userRouter.post(
  "/register/email",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { body } = req;
      const { email } = body;
      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new Error("해당 이메일을 가진 유저가 없습니다.");
      }
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
        // sign jwt key using secret key
        const secretKey = process.env.JWT_SECRET_KEY; // login 성공시 key값을 써서 토큰 생성
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          secretKey,
          {
            expiresIn: "7d",
          }
        );
        // respond with token and user id
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

userRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new Error("해당 이메일의 유저는 존재하지 않습니다.");
    }
    const expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const payload = { user, expireDate };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    await emailService.sendPasswordResetEmail(email, token);
    res.json({ result: "비밀번호 리셋 이메일이 정상적으로 발송되었습니다." });
  } catch (error) {
    next(error);
  }
});
userRouter.get("/reset-password/check-token", async (req, res, next) => {
  try {
    const { token } = req.query;
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
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
//user delete

userRouter.delete(
  "/:userId",
  loginRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const userAccessRole = req.user.role;
      await userIdJoiSchema.validateAsync({ userId });
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      const { role } = user;
      if (role === "admin" && userAccessRole === "admin") {
        throw new Error("관리자 권한으로 관리자 계정을 삭제할 수 없습니다.");
      }
      const result = await userService.deleteUser(userId);
      res.json({ user: result });
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get("/verify", async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { email, expireDate } = payload;
    //if expire date expired.. -send new token and alert user (front end bit, make validation page)
    const timeNow = new Date();
    const expireDateObj = new Date(expireDate);
    if (timeNow > expireDateObj) {
      emailService.sendValidationMail(email);
      throw new Error(
        "인증 이메일의 유효기간이 만료되어 새 인증메일을 발송했습니다."
      );
    }
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new Error("해당 유저의 가입기록이 없습니다.");
    }
    const { emailVerified } = user;
    if (emailVerified) {
      throw new Error("해당 유저는 이미 인증을 완료했습니다.");
    }
    const userInfo = user;
    const updatedUser = await userService.updateUserEmailValidation(userInfo);

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});
userRouter.patch("/:userId/reset-password/password", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { password, passwordRepeat } = req.body;
    await userPasswordResetJoiSchema.validateAsync({
      userId,
      password,
      passwordRepeat,
    });
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
    }
    const updatedUser = await userService.updateUserPassword(user, password);
    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});
userRouter.patch(
  "/:userId/change-name",
  loginRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      const isUserMatch = userId === String(user._id);
      if (!isUserMatch) {
        throw new Error(
          "현재 로그인한 유저와 api 유저 아이디가 일치하지 않습니다."
        );
      }
      const hashedPassword = user.password;
      const { name, password } = req.body;
      //joi schema
      const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordCorrect) {
        throw new Error("현재 비밀번호가 틀렸습니다.");
      }
      await userNameUpdateJoiSchema.validateAsync({
        name,
        password,
      });
      const updatedUser = await userService.updateUserName(user, name);
      res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

userRouter.patch(
  "/:userId/change-password",
  loginRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      const { password } = user;

      const isUserMatch = userId === String(user._id);
      if (!isUserMatch) {
        throw new Error(
          "현재 로그인한 유저와 api 유저 아이디가 일치하지 않습니다."
        );
      }
      const { newPassword, newPasswordRepeat, oldPassword } = req.body;
      //joi schema
      const isPasswordCorrect = await bcrypt.compare(oldPassword, password);
      if (!isPasswordCorrect) {
        throw new Error("현재 비밀번호가 틀렸습니다.");
      }
      await userPasswordUpdateJoiSchema.validateAsync({
        newPassword,
        newPasswordRepeat,
        oldPassword,
      });

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

userRouter.patch(
  "/role/:userId",
  loginRequired,
  superUserRequired,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      await userIdJoiSchema.validateAsync({ userId });
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error("해당 아이디의 유저는 존재하지 않습니다.");
      }
      const userInfo = user;
      console.log(userInfo);
      //update user role based userInfo
      const updatedUser = await userService.updateUserRole(userInfo);
      console.log(updatedUser);
      res.json({ updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = userRouter;
