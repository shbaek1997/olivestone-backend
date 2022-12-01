//Router
const express = require("express");
const filesRouter = express.Router();
// Hash password
const bcrypt = require("bcrypt");
//multer upload middleware
const upload = require("../middleware/upload");
//file service to check file expire
const { fileService } = require("../service/file.service");
// user authentication passport middleware
const { loginRequired } = require("../middleware/auth-jwt");
const timeService = require("../service/time.service");
const {
  fileDownloadJoiSchema,
  fileIdJoiSchema,
  filePasswordUpdateJoiSchema,
} = require("../db/schema/joi-schema/file.joi.schema");

filesRouter.get("/all", loginRequired, async (req, res, next) => {
  try {
    //get all files
    const files = await fileService.getAllFiles();
    //filtering valid files(not expired files)
    let validFiles = [];
    for (const file of files) {
      const isExpired = await fileService.isExpired(file._id);
      //if file is not expired
      if (!isExpired) {
        //add file to array
        validFiles.push(file);
      }
    }
    res.json({ files: validFiles });
  } catch (error) {
    next(error);
  }
});
filesRouter.patch(
  "/expireDate/:fileId",
  loginRequired,
  async (req, res, next) => {
    try {
      const { fileId } = req.params;
      await fileIdJoiSchema.validateAsync({ fileId });
      timeNow = new Date();
      const validPeriod = 0;
      const expireDate = timeService.timeToExpireTimeInKorea(
        timeNow,
        validPeriod
      );
      const file = await fileService.getFileById(fileId);
      if (!file) {
        throw new Error("해당 아이디의 파일은 존재하지 않습니다");
      }
      const fileInfo = { fileId, expireDate };
      const updatedFile = await fileService.updateFileExpireDate(fileInfo);
      fileService.checkFiles();
      res.json(updatedFile);
    } catch (error) {
      next(error);
    }
  }
);

//file change password...
filesRouter.patch(
  "/password/:fileId",
  loginRequired,
  async (req, res, next) => {
    try {
      const { fileId } = req.params;
      const { filePassword, fileRepeatPassword } = req.body;
      await filePasswordUpdateJoiSchema.validateAsync({
        fileId,
        password: filePassword,
        passwordRepeat: fileRepeatPassword,
      });
      const file = await fileService.getFileById(fileId);
      if (!file) {
        throw new Error("해당 아이디의 파일은 존재하지 않습니다");
      }
      const fileInfo = { fileId, filePassword };
      const updatedFile = await fileService.updateFilePassword(fileInfo);
      res.json(updatedFile);
    } catch (error) {
      next(error);
    }
  }
);

// file upload post request
filesRouter.post(
  "/upload",
  loginRequired,
  upload.single("file"),
  async (req, res, next) => {
    try {
      //if file is missing, upload middleware is skipped
      const { file, error } = req;
      if (error) {
        const { message } = error.details[0];
        throw new Error(message);
      }
      if (!file) {
        throw new Error("파일은 반드시 입력해야 합니다.");
      }
      // file password and validPeriod from req form body
      const { password, validPeriod } = req.body;
      //destructure file
      const { originalname, mimetype, path, filename } = file;
      const timeNow = new Date();
      const expireDate = timeService.timeToExpireTimeInKorea(
        timeNow,
        validPeriod
      );

      const fileInfo = {
        originalname,
        password,
        mimetype,
        filename,
        path,
        validPeriod,
        expireDate,
      };
      // save new file
      const savedFile = await fileService.saveFile(fileInfo);

      //response send saved file as json
      res.json({
        file: savedFile,
      });
    } catch (error) {
      next(error);
    }
  }
);

//file download post request - file ID and plain file password in body
filesRouter.post("/download/", async (req, res, next) => {
  try {
    //file id and plain password in request body
    const { fileId, plainPassword } = req.body;
    await fileDownloadJoiSchema.validateAsync({
      fileId,
      password: plainPassword,
    });
    // search file using file id
    const fileFound = await fileService.getFileById(fileId);
    if (!fileFound) {
      throw new Error("해당 아이디를 갖고 있는 파일은 존재하지 않습니다.");
    }
    //destructure file found
    const { path, mimeType, password } = fileFound;
    //check file password
    const isPasswordCorrect = await bcrypt.compare(plainPassword, password);
    if (!isPasswordCorrect) {
      throw new Error("입력한 비밀번호와 파일의 비밀번호가 일치하지 않습니다.");
    }
    //check file expiration date
    //valid period => 원래는 day기준인데 우선 min 기준으로 test
    const isExpired = await fileService.isExpired(fileId);
    if (isExpired) {
      throw new Error("파일의 유효기간이 만료되었습니다.");
    }
    // download file
    fileService.downloadFile(res, path, mimeType);
  } catch (error) {
    next(error);
  }
});
//curl command
//curl -X POST http://localhost:5000/files/download -H "Content-Type: application/json" -d '{"fileId":"636a08dcac8468e52ce5481f","plainPassword":"12345678"}' --output filename

filesRouter.get("/download/:fileId", loginRequired, async (req, res, next) => {
  try {
    const { fileId } = req.params;
    await fileIdJoiSchema.validateAsync({ fileId });
    const fileFound = await fileService.getFileById(fileId);
    if (!fileFound) {
      throw new Error("해당 아이디를 갖고 있는 파일은 존재하지 않습니다.");
    }
    const isExpired = await fileService.isExpired(fileId);
    if (isExpired) {
      throw new Error("파일의 유효기간이 만료되었습니다.");
    }
    const { path, mimeType, password } = fileFound;
    fileService.downloadFile(res, path, mimeType);
  } catch (error) {
    next(error);
  }
});

module.exports = filesRouter;
