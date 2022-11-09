const fs = require("fs");
const pathModule = require("path");
const bcrypt = require("bcrypt");
const iconvLite = require("iconv-lite"); //using utf-8 encode, decode conversion
const FileModel = require("../db/model/file.model");
const fileModel = new FileModel();

class FileService {
  constructor(fileModel) {
    this.fileModel = fileModel;
  }
  async getFileById(fileId) {
    const fileFound = await this.fileModel.findById(fileId);
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
    fs.unlink(path, (err) => {
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
    const validTimeInMinToSec = validPeriod * 60;
    const isExpired = timeDifference >= validTimeInMinToSec;
    // const validTimeInDayToSec = validPeriod * 60*60*24;
    // const isExpired = timeDifference >= validTimeInDayToSec;
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
