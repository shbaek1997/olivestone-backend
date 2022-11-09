//passport set up
const passport = require("passport");
// bcrypt to hash password
const bcrypt = require("bcrypt");
// local and jwt strategy
const LocalStrategy = require("passport-local").Strategy;
const { ExtractJwt, Strategy: JWTStrategy } = require("passport-jwt");
// user service
const { userService } = require("./user.service");

// set up passport-local
// passport-local: username, password field configure
const passportConfig = {
  usernameField: "username",
  passwordField: "password",
};
//specify passport-local strategy
const passportVerify = async (username, password, done) => {
  try {
    //find user by username
    const user = await userService.getUserByUsername(username);
    // no user means no user with the provided username
    if (!user) {
      done(null, false, {
        message:
          "해당 username은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.",
      });
      return;
    }
    // check user password
    const isPasswordCorrect = await bcrypt.compare(password, user.password); // password 일치 확인
    if (!isPasswordCorrect) {
      done(null, false, {
        message: "비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.",
      });
      return;
    }
    // if all passed
    done(null, user); // return user in done call back
    return;
  } catch (error) {
    done(error);
  }
};
// passport.use local strategy
// when passport use strategy "local", we use new strategy with passportConfig and passportVerify specified above
function passportConfiguration() {
  passport.use("local", new LocalStrategy(passportConfig, passportVerify));
}

//set up passport-jwt
// JWT config for where to find jwt token in request, jwt token key value
const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

//jwt payload - info in jwt
const JWTVerify = async (jwtPayload, done) => {
  try {
    //get user id from jwt payload
    const { userId } = jwtPayload;
    // find user by user id
    const user = await userService.getUserById(userId);
    if (!user) {
      //user is false, send error
      done(null, false, {
        message: "로그인한 유저만 사용할 수 있는 서비스입니다.",
      });
    }
    //if user, return user in done callback
    done(null, user);
    return;
  } catch (error) {
    done(error);
  }
};
//passport.use jwt strategy
function JWTConfiguration() {
  passport.use("jwt", new JWTStrategy(JWTConfig, JWTVerify));
}
//export passport-local and passport-jwt strategies
module.exports = { passportConfiguration, JWTConfiguration };
