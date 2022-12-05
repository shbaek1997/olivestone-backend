// express router
const express = require("express");
const userRouter = express.Router();
//passport and jwt for user authentication
const passport = require("passport");
const jwt = require("jsonwebtoken");
// check login middleware
const { loginRequired } = require("../middleware/auth-jwt");
//user service
const { userService } = require("../service/user.service");

// get request with passport middleware to check if user is logged in
userRouter.get("/auth", loginRequired, (req, res, next) => {
  const { user } = req;
  res.json({ user });
});

//user register post request to create new user (only for first user)
//not used unless register page is made
userRouter.post("/register", async (req, res, next) => {
  try {
    //body contains all the user info required
    const { body } = req;
    //create new user
    const newUser = await userService.createNewUser({ ...body });
    res.json({ user: newUser });
  } catch (error) {
    next(error);
  }
});

// user login post request using passport.authenticate with local strategy
userRouter.post("/login", async (req, res, next) => {
  try {
    //using jwt, so session is false
    passport.authenticate("local", { session: false }, (error, user, info) => {
      // user is user object if validated otherwise user becomes false boolean
      if (error || !user) {
        // passport fail or user = false
        // error message is in info variable
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
        const token = jwt.sign({ userId: user._id }, secretKey, {
          expiresIn: "7d",
        });
        // respond with token and user id
        res.status(200).json({
          token,
          userId: user._id,
        });
      });
    })(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;
