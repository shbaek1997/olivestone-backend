const passport = require("passport");
const loginRequired = passport.authenticate("jwt", { session: false });
module.exports = { loginRequired };
