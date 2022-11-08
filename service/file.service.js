const FileModel = require("../db/model/file.model");
const fs = require("fs");
const pathModule = require("path");
const bcrypt = require("bcrypt");
const iconvLite = require("iconv-lite"); //using utf-8 encode, decode conversion
const fileModel = new FileModel();

class FileService {
  constructor(fileModel) {
    this.fileModel = fileModel;
  }
  async getFileById(fileId) {
    const fileFound = await this.fileModel.findById(fileId);
    //비밀번호 부분 추가?
    return fileFound;
  }
  async saveFile(fileInfo) {
    const { originalname, password, mimetype, filename, path, validPeriod } =
      fileInfo;
    //decode korean names back to korean when upload
    const originalName = iconvLite.decode(originalname, "UTF-8");
    const id = filename.slice(0, 24);
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newFileInfo = {
      _id: id,
      originalName,
      path,
      password: hashedPassword,
      mimeType: mimetype,
      validPeriod,
    };
    const savedFile = await this.fileModel.createFile(newFileInfo);
    return savedFile;
  }
  async deleteFile(fileId) {
    const fileFound = await this.getFileById(fileId);
    const { path } = fileFound;
    console.log("path", path);
    fs.unlink(`${path}`, (err) => {
      console.log(err);
    });
  }
  async isExpired(fileId) {
    const now = new Date();
    const fileFound = await this.getFileById(fileId);
    if (!fileFound) {
      throw new Error("file not found");
    }
    const { createdAt, validPeriod } = fileFound;
    const timeDifference = (now - createdAt) / 1000; //in sec
    const validTimeInMinToSec = validPeriod * 60; //change to days later
    const isExpired = timeDifference >= validTimeInMinToSec;
    return isExpired;
  }
  checkFiles() {
    const absolutePath = pathModule.join(__dirname, "../uploads");
    fs.readdir(absolutePath, (err, files) => {
      if (err) {
        console.log(err);
      }
      const dirFiles = files.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
      if (dirFiles.length === 0) {
        console.log("no files!");
        return;
      }
      dirFiles.forEach(async (file) => {
        const fileId = file.slice(0, 24);
        const isExpired = await this.isExpired(fileId);
        isExpired
          ? await this.deleteFile(fileId)
          : console.log("not deleted", fileId);
      });
    });
  }
}
const fileService = new FileService(fileModel);
module.exports = { fileService };
