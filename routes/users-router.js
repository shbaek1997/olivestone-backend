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
const { userService } = require("../service/user.service");
const {
  userRegisterJoiSchema,
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
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

//get all users except super user
userRouter.get(
  "/users",
  loginRequired,
  superUserRequired,
  async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
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

module.exports = userRouter;
