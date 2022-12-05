//use express
const express = require("express");
//cors for cross-origin-resource-sharing error
const cors = require("cors");
// passport for user authentication
const passport = require("passport");
// use morgan for loggin console
const logger = require("morgan");
// dotenv to use .env file
require("dotenv").config();
//using passport-local and passport-jwt
const {
  passportConfiguration,
  JWTConfiguration,
} = require("./service/auth.service");

//Routers
const usersRouter = require("./routes/users-router");
const filesRouter = require("./routes/files-router");

//file service to delete files when expired periodically
const { fileService } = require("./service/file.service");

//error handler middleware
const { errorHandler } = require("./middleware/error-handler");

//create express app
const app = express();

//initialize db, connect to MongoDB
const db = require("./db");
db();

//use logger
app.use(logger("dev"));
//use cors and expose headers too get original file name for download api
app.use(cors({ exposedHeaders: ["Content-Disposition"] }));

//express body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//initialize passport and use strategies
app.use(passport.initialize());
passportConfiguration();
JWTConfiguration();

//use routers and error-handling middleware
app.use("/api/users", usersRouter);
app.use("/api/files", filesRouter);
app.use(errorHandler);

//setInterval to delete file periodically
// const timeInterval = 1000 * 60 * 10; in ms, value is 10min now.
const shortTimeInterval = 1000 * 60 * 60 * 1; //1hr
fileService.checkFiles();
setInterval(() => {
  fileService.checkFiles();
  console.log("set interval working");
}, shortTimeInterval);

module.exports = app;
