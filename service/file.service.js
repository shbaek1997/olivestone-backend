// fs for file handling
const fs = require("fs");
// path for easy path
const pathModule = require("path");
// hash password
const bcrypt = require("bcrypt");
//using utf-8 encode, decode conversion
const iconvLite = require("iconv-lite");
//using file model
const FileModel = require("../db/model/file.model");
const fileModel = new FileModel();
const timeService = require("./time.service");
const { create } = require("domain");
class FileService {
  constructor(fileModel) {
    this.fileModel = fileModel;
  }
  async getFileById(fileId) {
    const fileFound = await this.fileModel.findById(fileId);
    return fileFound;
  }
  async getAllFiles() {
    const files = await this.fileModel.findAll();
    return files;
  }
  async updateFilePassword(fileInfo) {
    const { fileId, filePassword } = fileInfo;
    const salt = 10;
    const hashedFilePassword = await bcrypt.hash(filePassword, salt);
    const updatedFile = await this.fileModel.updateFilePassword(
      fileId,
      hashedFilePassword
    );
    return updatedFile;
  }
  async saveFile(fileInfo) {
    const {
      originalname,
      password,
      mimetype,
      filename,
      path,
      validPeriod,
      expireDate,
    } = fileInfo;
    //decode korean names back to korean when upload
    const originalName = iconvLite.decode(originalname, "UTF-8");
    // retrieve mongo id used in upload middleware
    // mongo id is alway 24 letters long
    const id = filename.slice(0, 24);
    const salt = 10;
    //hash password
    const hashedPassword = await bcrypt.hash(password, salt);
    const newFileInfo = {
      _id: id,
      originalName,
      path,
      password: hashedPassword,
      mimeType: mimetype,
      validPeriod,
      expireDate,
    };
    const savedFile = await this.fileModel.createFile(newFileInfo);
    return savedFile;
  }
  async deleteFile(fileId) {
    const fileFound = await this.getFileById(fileId);
    const { path } = fileFound;
    fs.unlink(path, (err) => {
      console.log(err);
    });
  }
  async isExpired(fileId) {
    const fileFound = await this.getFileById(fileId);
    if (!fileFound) {
      throw new Error("file not found");
    }
    const { expireDate } = fileFound;
    //current time in Korea
    const timeNowInKorea = new Date(); //utc time으로 보임
    timeNowInKorea.setTime(timeNowInKorea.getTime() + 9 * 60 * 60 * 1000);
    // if time timeNowInkorea is greater => file is expired and it should be deleted
    console.log("timeNow:", timeNowInKorea, "expire time:", expireDate);
    const isExpired = expireDate < timeNowInKorea;
    return isExpired;
  }
  downloadFile(res, path, mimeType) {
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
  }
  // check all files in directory and delete file in directory if expired
  checkFiles() {
    const absolutePath = pathModule.join(__dirname, "../uploads");
    // read all files in /uploads directory
    fs.readdir(absolutePath, (err, files) => {
      if (err) {
        console.log(err);
      }
      // Directory files without hidden files
      const dirFiles = files.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
      //if no file in directory
      if (dirFiles.length === 0) {
        console.log("no files!");
        return;
      }
      //else
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
