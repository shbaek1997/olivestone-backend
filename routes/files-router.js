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

// file upload post request
filesRouter.post(
  "/upload",
  loginRequired,
  upload.single("file"),
  async (req, res, next) => {
    try {
      // get file object, check password(from upload middleware) variables from req
      const { file, passwordLengthOk, passwordRepeatOk, validPeriodOk } = req;
      if (!passwordLengthOk) {
        throw new Error("파일 비밀번호는 최소 8글자이어야 합니다.");
      }
      if (!passwordRepeatOk) {
        throw new Error("파일 비밀번호와 비밀번호 확인이 일치 하지 않습니다.");
      }
      if (!validPeriodOk) {
        throw new Error("파일 유효기간 설정은 1미만으로 할 수 없습니다.");
      }
      // file password and validPeriod from req form body
      const { password, validPeriod } = req.body;
      //destructure file
      const { originalname, mimetype, path, filename } = file;

      const fileInfo = {
        originalname,
        password,
        mimetype,
        filename,
        path,
        validPeriod,
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

module.exports = filesRouter;
