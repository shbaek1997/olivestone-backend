const express = require("express");
const uploadRouter = express.Router();
const upload = require("../middleware/upload");
//post 요청의 key값이 single() 안의 문자열이어여 하고, 이 때 DB에 저장해야함..
uploadRouter.post("/", upload.single("file"), (req, res, next) => {
  const { file } = req;
  console.log("file", file);
  res.send("trying uploads");
});
module.exports = uploadRouter;
