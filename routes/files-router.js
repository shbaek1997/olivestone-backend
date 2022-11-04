const express = require("express");
const filesRouter = express.Router();
const bcrypt = require("bcrypt");
const pathModule = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
const { fileService } = require("../service/file.service");
const { loginRequired } = require("../middleware/auth-jwt");
const iconvLite = require("iconv-lite");
//post 요청의 key값이 single() 안의 문자열이어여 하고, 이 때 DB에 저장해야함..
filesRouter.post(
  "/upload",
  loginRequired,
  upload.single("file"),
  async (req, res, next) => {
    try {
      //실험을 하면서 upload 미들웨어가 성공하지 않으면 어떻게 되는지 확인해야겠다...
      console.log("hello");
      const { file } = req;
      if (!file) {
        throw new Error("첨부된 파일이 없습니다.");
      }
      const { password, passwordRepeat } = req.body;
      //이부분에서 파일을 지우던지 아니면 파일 업로드가 나중에 되게 하던지 해야겠다..
      if (password.length < 8) {
        throw new Error("파일 비밀번호는 최소 8글자이어야 합니다.");
      }
      if (password !== passwordRepeat) {
        throw new Error("파일 비밀번호와 비밀번호 확인이 일치 하지 않습니다.");
      }
      const { originalname, mimetype, path, filename } = file;

      const fileInfo = { originalname, password, mimetype, filename, path };
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
    const { path, mimeType, password } = fileFound;
    const isPasswordCorrect = await bcrypt.compare(plainPassword, password);
    if (!isPasswordCorrect) {
      throw new Error("입력한 비밀번호와 파일의 비밀번호가 일치하지 않습니다.");
    }
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
//curl -X POST http://localhost:5000/files/download -H "Content-Type: application/json" -d '{"fileId":"63646c62e8b26cfc8adbdd40","plainPassword":"12345678"}' --output filename

module.exports = filesRouter;
