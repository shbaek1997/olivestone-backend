const FileModel = require("../db/model/file.model");
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
    const { originalname, password, mimetype, filename, path } = fileInfo;
    const originalName = iconvLite.decode(originalname, "euc-kr");
    const id = filename.slice(-24);
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newFileInfo = {
      _id: id,
      originalName,
      path,
      password: hashedPassword,
      mimeType: mimetype,
    };
    console.log(newFileInfo);
    const savedFile = await this.fileModel.createFile(newFileInfo);
    console.log(savedFile);
    return savedFile;
  }
  convertDownloadFileName(fileName) {
    const convertedFileName = iconvLite.decode(
      iconvLite.encode(fileName, "UTF-8"),
      "ISO-8859-1"
    );
    return convertedFileName;
  }
}
const fileService = new FileService(fileModel);
module.exports = { fileService };
