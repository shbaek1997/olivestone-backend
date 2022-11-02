const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { userService } = require("../service/user.service");
const userRouter = express.Router();

userRouter.post("/hi", async (req, res, next) => {
  console.log("he");
  res.send("this works");
});
userRouter.post("/register", async (req, res, next) => {
  const { body } = req;
  const newUser = await userService.createNewUser({ ...body });
  res.json({ user: newUser });
});
userRouter.post("/login", async (req, res, next) => {
  try {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      // 성공적으로 유저가 있어야 유저 객체가 생기고,
      //유저 인증 실패시 유저는 자동으로 false;

      if (error || !user) {
        // passport 인증 실패 or 유저가 없으면 error
        console.log("error", error);
        res.status(400).json({
          error: error,
        });
        return;
      }
      req.login(user, { session: false }, (loginError) => {
        // login을 하면
        if (loginError) {
          res.status(400).send(loginError);
          return;
        }
        const secretKey = process.env.JWT_SECRET_KEY; // login 성공시 key값을 써서 토큰 생성
        const token = jwt.sign({ userId: user._id }, secretKey, {
          expiresIn: "7d",
        });
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
