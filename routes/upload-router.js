const express = require("express");
const uploadRouter = express.Router();
const upload = require("../middleware/upload");
const { fileService } = require("../service/file.service");
//post 요청의 key값이 single() 안의 문자열이어여 하고, 이 때 DB에 저장해야함..
uploadRouter.post("/", upload.single("file"), async (req, res, next) => {
  const { file } = req;
  const { password } = req.body;
  const { originalname, mimetype, path, filename } = file;
  const fileInfo = { originalname, password, mimetype, filename, path };
  const savedFile = await fileService.saveFile(fileInfo);

  res.json({
    file: savedFile,
  });
});
module.exports = uploadRouter;
