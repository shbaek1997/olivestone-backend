const express = require("express");
const filesRouter = express.Router();
const bcrypt = require("bcrypt");
const pathModule = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
const { fileService } = require("../service/file.service");
const { loginRequired } = require("../middleware/auth-jwt");
const { create } = require("domain");
const { type } = require("os");

//post 요청의 key값이 single() 안의 문자열이어여 하고, 이 때 DB에 저장해야함..
filesRouter.post(
  "/upload",
  loginRequired,
  upload.single("file"),
  async (req, res, next) => {
    try {
      //실험을 하면서 upload 미들웨어가 비밀번호 확인 부분을 다시 해야함..
      const { file } = req;
      if (!file) {
        throw new Error("첨부된 파일이 없습니다.");
      }
      const { password, validPeriod } = req.body;
      const { originalname, mimetype, path, filename } = file;

      const fileInfo = {
        originalname,
        password,
        mimetype,
        filename,
        path,
        validPeriod,
      };
      const savedFile = await fileService.saveFile(fileInfo);

      res.json({
        file: savedFile,
      });
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post("/download/", async (req, res, next) => {
  try {
    //file id could be in body;
    const { fileId, plainPassword } = req.body;
    const fileFound = await fileService.getFileById(fileId);
    console.log("filefound", fileFound);
    if (!fileFound) {
      throw new Error("해당 아이디를 갖고 있는 파일은 존재하지 않습니다.");
    }
    const { path, mimeType, password, validPeriod, createdAt } = fileFound;
    const isPasswordCorrect = await bcrypt.compare(plainPassword, password);
    if (!isPasswordCorrect) {
      throw new Error("입력한 비밀번호와 파일의 비밀번호가 일치하지 않습니다.");
    }
    const now = new Date();
    const timeDifference = (now - createdAt) / 1000; //in sec
    const validTimeInMinToSec = validPeriod * 60; //change to days later

    const isExpired = timeDifference >= validTimeInMinToSec;
    console.log("val", validTimeInMinToSec, "diff", timeDifference);
    if (isExpired) {
      throw new Error("파일의 유효기간이 만료되었습니다.");
    }
    //valid period => 원래는 day기준인데 우선 min 기준으로 test

    const absolutePath = pathModule.join(__dirname, "../", path);
    const fileName = pathModule.basename(absolutePath);
    const newFileName = encodeURI(fileName);
    res.setHeader("Content-Disposition", "attachment;filename=" + newFileName);
    res.setHeader("Content-type", mimeType);
    const filestream = fs.createReadStream(absolutePath);
    filestream.pipe(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//curl command
//curl -X POST http://localhost:5000/files/download -H "Content-Type: application/json" -d '{"fileId":"6368a6baeaefbec486e1c0e2","plainPassword":"12345678"}' --output filename

module.exports = filesRouter;
