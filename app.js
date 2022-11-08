const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const {
  passportConfiguration,
  JWTConfiguration,
} = require("./service/auth.service");
const usersRouter = require("./routes/users-router");
const filesRouter = require("./routes/files-router");
const { fileService } = require("./service/file.service");

const { errorHandler } = require("./middleware/error-handler");
var app = express();

const db = require("./db");

db();

app.use(logger("dev"));
app.use(cors({ exposedHeaders: ["Content-Disposition"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
passportConfiguration();
JWTConfiguration();
app.use("/users", usersRouter);
app.use("/files", filesRouter);
app.use(errorHandler);

//setInterval to delete file periodically
// const timeInterval = 1000 * 60 * 10; in ms, value is 10min now.
const shortTimeInterval = 1000 * 10;
setInterval(() => {
  fileService.checkFiles();
  console.log("set interval working");
}, shortTimeInterval);

module.exports = app;
