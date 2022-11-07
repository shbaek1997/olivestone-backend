var createError = require("http-errors");
var express = require("express");
const cors = require("cors");
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
const filesRouter = require("./routes/files-router");

const { errorHandler } = require("./middleware/error-handler");
var app = express();

const db = require("./db");
// view engine setup

db();

app.use(logger("dev"));
app.use(cors({ exposedHeaders: ["Content-Disposition"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
passportConfiguration();
JWTConfiguration();
app.use("/", indexRouter);
app.use("/users", usersRouter);
// app.use("/files", loginRequired, filesRouter);
app.use("/files", filesRouter);
app.use(errorHandler);

module.exports = app;
