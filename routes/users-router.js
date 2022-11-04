const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { userService } = require("../service/user.service");
const { loginRequired } = require("../middleware/auth-jwt");
const userRouter = express.Router();

userRouter.get("/auth", loginRequired, (req, res, next) => {
  const { user } = req;
  console.log(user);
  res.json({ user });
});
//우선 거의 안쓰니까 register는 이정도로 두고...
userRouter.post("/register", async (req, res, next) => {
  try {
    const { body } = req;
    const newUser = await userService.createNewUser({ ...body });
    res.json({ user: newUser });
  } catch (error) {
    next(error);
  }
});
userRouter.post("/login", async (req, res, next) => {
  try {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      // 성공적으로 유저가 있어야 유저 객체가 생기고,
      //유저 인증 실패시 유저는 자동으로 false;
      console.log("user", user);
      if (error || !user) {
        // passport 인증 실패 or 유저가 없으면 error
        console.log("error", error);
        res.status(400).json({
          result: "error",
          reason: "username이나 비밀번호가 틀렸습니다.",
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
