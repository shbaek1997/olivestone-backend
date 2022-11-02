var createError = require("http-errors");
var express = require("express");
const passport = require("passport");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const {
  passportConfiguration,
  JWTConfiguration,
} = require("./service/auth.service");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users-router");
const uploadRouter = require("./routes/upload-router");
const { loginRequired } = require("./middleware/auth-jwt");
var app = express();

const db = require("./db");
// view engine setup

db();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
passportConfiguration();
JWTConfiguration();
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/upload", loginRequired, uploadRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    err,
  });
});

module.exports = app;
