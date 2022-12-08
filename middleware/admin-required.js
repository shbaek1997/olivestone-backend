const adminRequired = (req, res, next) => {
  const role = req.user.role;
  if (role === "admin" || role === "super-user") {
    next();
    return;
  }
  throw new Error("admin 권한이 없습니다.");
};

module.exports = { adminRequired };
