//Router
const express = require("express");
const filesRouter = express.Router();
// Hash password
const bcrypt = require("bcrypt");
//For directory, file path
const pathModule = require("path");
// fs to handle file download
const fs = require("fs");
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
      const { file, passwordLengthOk, passwordRepeatOk } = req;
      if (!passwordLengthOk) {
        throw new Error("파일 비밀번호는 최소 8글자이어야 합니다.");
      }
      if (!passwordRepeatOk) {
        throw new Error("파일 비밀번호와 비밀번호 확인이 일치 하지 않습니다.");
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
    const isExpired = await fileService.isExpired(fileId);
    if (isExpired) {
      throw new Error("파일의 유효기간이 만료되었습니다.");
    }
    //valid period => 원래는 day기준인데 우선 min 기준으로 test

    //use path to get file's absolute path
    const absolutePath = pathModule.join(__dirname, "../", path);
    // get file name with ID
    const fileName = pathModule.basename(absolutePath);
    //encode fileName to convert korean to valid format in response header
    const encodedFileName = encodeURI(fileName);
    //set header to include file name and mime type
    res.setHeader(
      "Content-Disposition",
      "attachment;filename=" + encodedFileName
    );
    res.setHeader("Content-type", mimeType);
    //send download file to client using fs
    const filestream = fs.createReadStream(absolutePath);
    filestream.pipe(res);
  } catch (error) {
    next(error);
  }
});
//curl command
//curl -X POST http://localhost:5000/files/download -H "Content-Type: application/json" -d '{"fileId":"636a08dcac8468e52ce5481f","plainPassword":"12345678"}' --output filename

module.exports = filesRouter;
