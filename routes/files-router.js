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
      const { password } = req.body;
      if (password.length < 8) {
        throw new Error("파일 비밀번호는 최소 8글자이어야 합니다.");
      }
      const { originalname, mimetype, path, filename } = file;
      const decode_1 = iconvLite.decode(originalname, "UTF-8");
      const decode_2 = iconvLite.decode(originalname, "ISO-8859-1");
      const decode_3 = iconvLite.decode(
        iconvLite.encode(originalname, "UTF-8"),
        "ISO-8859-1"
      );

      console.log("decreypted", decode_1);
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
    const convertedFileName = fileService.convertDownloadFileName(fileName);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + convertedFileName
    );
    res.setHeader("Content-type", mimeType);
    const header = req.headers["user-agent"];
    const filestream = fs.createReadStream(absolutePath);
    filestream.pipe(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = filesRouter;
