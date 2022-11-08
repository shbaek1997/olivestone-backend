// check authentication middleware, return unauthorized without proper jwt token
const passport = require("passport");
const loginRequired = passport.authenticate("jwt", { session: false });
module.exports = { loginRequired };
