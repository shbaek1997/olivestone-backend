// check authentication middleware, return unauthorized if invalid/no jwt token
const passport = require("passport");
const loginRequired = passport.authenticate("jwt", { session: false });
module.exports = { loginRequired };
