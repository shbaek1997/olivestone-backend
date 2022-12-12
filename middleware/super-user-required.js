const superUserRequired = (req, res, next) => {
  const role = req.user.role;
  if (role === "super-user") {
    next();
    return;
  }
  throw new Error("super user 권한이 없습니다.");
};

module.exports = { superUserRequired };
